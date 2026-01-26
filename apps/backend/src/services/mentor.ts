import { createOpenAI } from "@ai-sdk/openai";
import { streamText, generateText } from "ai";
import prisma from "../lib/prisma";
import { z } from "zod";

const openai = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY!,
})

const model = openai.responses("gpt-4.1-mini-2025-04-14");

class Mentor {
    // Test function to verify OpenAI connection
    async testConnection() {
        try {
            const result = await generateText({
                model,
                prompt: "Hello, this is a test. Please respond with 'Connection successful'.",
            });
            return { success: true, message: result.text };
        } catch (error) {
            console.error("OpenAI connection test failed:", error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }

    async respondCandidate(user_id: string, mentor_session_id: string) {
        
        // Test connection first
        const connectionTest = await this.testConnection();
        if (!connectionTest.success) {
            throw new Error(`OpenAI connection failed: ${connectionTest.error}`);
        }

        const messages = await prisma.mentor_message.findMany({
            where: {
                session_id: mentor_session_id
            },
            orderBy: {
                created_at: "asc",
            },
        });


        const conversationHistory = messages.map((message) => {
            const role = message.messenger_role === "ai_mentor" ? "assistant" as const : 
                        message.messenger_role === "candidate" ? "user" as const : "system" as const;
            
            const content = typeof message.content === 'object' && message.content !== null && 'text' in message.content
                ? (message.content as { text: string }).text
                : String(message.content);
            
            return {
                role,
                content
            };
        });

        const systemPrompt = `You are ZeroCV AI Career Coach - an expert AI mentor specializing in technical interview preparation, career development, and personalized skill improvement for software engineers and tech professionals.

## YOUR EXPERTISE & PERSONALITY
- **Senior Technical Interviewer**: 15+ years of experience across FAANG, startups, and scale-ups
- **Career Development Specialist**: Expert in technical career progression, skill assessment, and personalized learning paths
- **Data-Driven Coach**: Make recommendations based on actual performance data, not generic advice
- **Empathetic Mentor**: Supportive and encouraging while providing honest, actionable feedback
- **Industry-Aware**: Current knowledge of tech trends, hiring practices, and skill demands

## YOUR COACHING APPROACH
**Assessment-First**: Always analyze the candidate's complete profile and performance history before providing advice
**Personalized Guidance**: Tailor advice to their experience level, career goals, and specific improvement areas
**Actionable Plans**: Provide concrete steps, timelines, and measurable outcomes
**Growth Mindset**: Focus on continuous improvement and long-term career development
**Holistic View**: Consider technical skills, communication, problem-solving, and cultural fit

## AVAILABLE USER DATA ANALYSIS TOOLS

You MUST use these tools to gather comprehensive insights before providing coaching:

**get_user_context**: Access complete candidate profile including:
- Professional background, skills, experience, education
- Current projects, achievements, and career interests
- LinkedIn, GitHub, portfolio links for context
- Location and job preferences

**get_interview_performance**: Access detailed interview analytics including:
- Performance scores across 5 dimensions (Technical Skills, Communication, Reasoning, Creativity, Cultural Fit)
- AI-generated performance summaries and feedback
- Interview transcripts and conversation analysis
- Tool usage results (coding challenges, system design)
- Interview duration, round types, and completion status
- Recruiter decisions and outcomes

**get_skill_analysis**: Access comprehensive skill trends including:
- Performance evolution across multiple interviews
- Strengths and improvement areas identification
- Interview type performance comparison (Technical, Behavioral, System Design)
- Success patterns and recurring challenges

**web_search**: Find current industry trends, courses, and resources for improvement recommendations also make sure that the results are valid and not outdated.

## DATA-DRIVEN COACHING FRAMEWORK

**Phase 1: Complete Assessment** (ALWAYS start here)
1. Analyze user profile and background context
2. Review interview performance history and patterns
3. Identify skill gaps and improvement opportunities
4. Understand career goals and trajectory

**Phase 2: Performance Analysis**
- Break down scores by competency area (Technical 30%, Communication 25%, Reasoning 20%, Creativity 15%, Cultural Fit 10%)
- Analyze conversation transcripts for communication patterns
- Review tool usage (coding, system design) for technical assessment
- Identify behavioral interview performance trends

**Phase 3: Personalized Recommendations**
- Create specific improvement plans for each skill area
- Recommend targeted practice resources and courses
- Suggest interview preparation strategies
- Provide timeline and milestone tracking

## COACHING SPECIALIZATIONS

**Technical Interview Prep**:
- Algorithm and data structure mastery
- System design methodology and best practices
- Coding interview optimization techniques
- Language-specific skill development

**Communication & Soft Skills**:
- Technical concept explanation improvement
- Structured problem-solving communication (STAR method)
- Confidence building and anxiety management
- Cultural fit and behavioral interview excellence

**Career Strategy**:
- Role targeting and application strategy
- Skill development roadmaps aligned with career goals
- Industry trend awareness and adaptation
- Professional branding and portfolio optimization

## INTERACTION GUIDELINES

**Always Lead with Data**: "Based on your interview performance data, I've identified..."
**Be Specific**: Provide exact study plans, resource links, practice schedules
**Show Progress**: Reference improvements from previous interviews when applicable
**Stay Current**: Include latest industry trends and hiring practices in recommendations
**Encourage Growth**: Celebrate improvements while identifying next-level opportunities

*CRITICAL*: Generate “compact” Markdown.
- Never output more than one blank line in a row.
- Lists must use - Item at column 0; nested lists use exactly two spaces + -.
- Use single newlines for paragraphs and section breaks.
- Surround --- with no extra blank lines.

## RESPONSE STRUCTURE

1. **Performance Summary**: Brief overview of current strengths and areas for improvement
2. **Detailed Analysis**: Specific insights from interview data and patterns
3. **Actionable Plan**: Step-by-step improvement strategy with timelines
4. **Resources**: Curated learning materials, practice platforms, and courses
5. **Next Steps**: Immediate actions to take and progress tracking methods

## CONTEXT VARIABLES
User ID: ${user_id}
Current Query: "${conversationHistory[conversationHistory?.length - 1]?.content}"

**IMPORTANT**: You must ALWAYS call the data analysis tools first to understand the user's complete context before providing any coaching advice. Generic advice without data analysis is not acceptable.

Begin your coaching session by gathering comprehensive user insights through the available tools.`;

        try {
            
            const mentor = await streamText({
                model,
                system: systemPrompt,
                messages: conversationHistory,
                
                tools: {
					web_search_preview: openai.tools.webSearchPreview({
                        searchContextSize: "high",
                        userLocation: {
                            type: "approximate",
                            country: "IN",
                        }
                    }),
                    get_user_context: {
                        description: "Get comprehensive user profile and background information including professional details, skills, and career trajectory",
                        parameters: z.object({
                            user_id: z.string().describe("The user id"),
                        }),
                        execute: async ({ user_id }) => {
                            try {
                                const userData = await prisma.user.findUnique({
                                    where: { id: user_id },
                                    include: {
                                        candidate_profile: true,
                                        candidate_applications: {
                                            select: {
                                                id: true,
                                                status: true,
                                                applied_at: true,
                                                job_description: {
                                                    select: {
                                                        title: true,
                                                        description: true,
                                                        jd_payload: true,
                                                        is_mock: true,
                                                        recruiter: {
                                                            select: {
                                                                name: true,
                                                                recruiter_profile: {
                                                                    select: {
                                                                        company_name: true,
                                                                        company_industry: true
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            orderBy: {
                                                applied_at: 'desc'
                                            },
                                            take: 10
                                        }
                                    },
                                });

                                // Calculate career insights
                                const careerInsights = {
                                    total_applications: userData?.candidate_applications?.length || 0,
                                    recent_activity: userData?.candidate_applications?.slice(0, 3) || [],
                                    mock_interview_count: userData?.candidate_applications?.filter(app => 
                                        app.job_description.is_mock
                                    ).length || 0
                                };

                                return {
                                    ...userData,
                                    career_insights: careerInsights
                                };
                            } catch (error) {
                                console.error("Error fetching user data:", error);
                                return null;
                            }
                        },
                    },

                    get_interview_performance: {
                        description: "Get detailed interview performance data and feedback",
                        parameters: z.object({
                            user_id: z.string().describe("The user id"),
                        }),
                        execute: async ({ user_id }) => {
                            try {
                                const interviewSessions = await prisma.interview_session.findMany({
                                    where: {
                                        application: {
                                            candidate_id: user_id,
                                        },
                                    },
                                    select: {
                                        id: true,
                                        created_at: true,
                                        application: {
                                            select: {
                                                job_description: {
                                                    select: {
                                                        title: true,
                                                        description: true
                                                    }
                                                }
                                            }
                                        },
                                        interview_round: {
                                            select: {
                                                round_number: true,
                                                round_type: true,
                                                started_at: true,
                                                end_at: true,
                                                status: true,
                                                zero_score: true,
                                                score_components: true,
                                                ai_summary: true,
                                                report_data: true,
                                                recruiter_decision: true,
                                            },
                                        },
                                    },
                                    orderBy: {
                                        created_at: "desc",
                                    },
                                    take: 5,
                                });

                                return interviewSessions;
                            } catch (error) {
                                console.error("Error fetching interview performance:", error);
                                return [];
                            }
                        },
                    },

                    get_skill_analysis: {
                        description: "Analyze candidate's skills across multiple interviews",
                        parameters: z.object({
                            user_id: z.string().describe("The user id"),
                        }),
                        execute: async ({ user_id }) => {
                            try {
                                const rounds = await prisma.interview_round.findMany({
                                    where: {
                                        session: {
                                            application: {
                                                candidate_id: user_id,
                                            },
                                        },
                                        score_components: {
                                            not: "null"
                                        }
                                    },
                                    select: {
                                        round_type: true,
                                        zero_score: true,
                                        score_components: true,
                                        ai_summary: true,
                                        created_at: true
                                    },
                                    orderBy: {
                                        created_at: "desc"
                                    }
                                });

                                return {
                                    total_interviews: rounds.length,
                                    performance_trends: rounds,
                                    improvement_areas: rounds.filter(r => r.zero_score && r.zero_score < 70)
                                };
                            } catch (error) {
                                console.error("Error fetching skill analysis:", error);
                                return {
                                    total_interviews: 0,
                                    performance_trends: [],
                                    improvement_areas: []
                                };
                            }
                        },
                    }
                },

                // Proper configuration for tools
                toolChoice: "auto",
                maxSteps: 5,
                temperature: 0.7,
                maxTokens: 2000,
            });
            
            return mentor.fullStream;
        } catch (error) {
            console.error("Error creating streamText:", error);
            console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
            throw error;
        }
    }

    async createMentorSession(user_id: string, title?: string) {
        return await prisma.mentor_session.create({
            data: {
                candidate_id: user_id,
                title: title || "New Coaching Session "
            }
        });
    }

    async getMentorSessions(user_id: string) {
        return await prisma.mentor_session.findMany({
            where: {
                candidate_id: user_id
            },
            include: {
                mentor_messages: {
                    select: {
                        id: true,
                        messenger_role: true,
                        content: true,
                        created_at: true
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                }
            },
            orderBy: {
                updated_at: 'desc'
            }
        });
    }
}

export default new Mentor();
