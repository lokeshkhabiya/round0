import OpenAI from "openai";
import prisma from "../lib/prisma";

interface ScoringCriteria {
	technical_skills: number;
	communication: number;
	reasoning: number;
	creativity: number;
	cultural_fit: number;
}

interface ScoringResult {
	zero_score: number;
	score_components: ScoringCriteria;
	ai_summary: string;
	recommendations: string[];
	report_data: string;
}

class ScoringEngine {
	private openai: OpenAI;

	constructor() {
		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY!,
		});
	}

	async scoreRound(roundId: string): Promise<ScoringResult> {
		try {
			// Fetch round data with all related information
			const round = await prisma.interview_round.findUnique({
				where: { id: roundId },
				include: {
					messages: {
						orderBy: { created_at: "asc" },
					},
					tool_results: true,
					session: {
						include: {
							application: {
								include: {
									job_description: {
										include: {
											recruiter: true,
										},
									},
									candidate: true,
								},
							},
						},
					},
				},
			});

			if (!round) {
				throw new Error(`Round ${roundId} not found`);
			}

			// Prepare evaluation data
			const evaluationData = this.prepareEvaluationData(round);

			// Generate scoring using OpenAI
			const scoringResult = await this.generateScoring(evaluationData);

			// Update database with scores
			await prisma.interview_round.update({
				where: { id: roundId },
				data: {
					zero_score: scoringResult.zero_score,
					score_components: JSON.stringify(
						scoringResult.score_components,
					),
					ai_summary: scoringResult.ai_summary,
					report_generated_at: new Date(),
					report_data: scoringResult.report_data,
				},
			});

			return scoringResult;
		} catch (error) {
			console.error("Error scoring round:", error);
			throw error;
		}
	}

	private prepareEvaluationData(round: any): any {
		const { job_description, candidate } = round.session.application;

		// Extract conversation transcript
		const transcript = round.messages.map((msg: any) => ({
			role: msg.messenger_role,
			content: msg.content,
			timestamp: msg.created_at,
			type: msg.message_type,
		}));

		// Extract tool results
		const toolResults = round.tool_results.map((result: any) => ({
			tool: result.tool_name,
			input: result.input_data,
			output: result.output_data,
			passed: result.passed,
			metadata: result.metadata,
		}));

		return {
			round_info: {
				type: round.round_type,
				number: round.round_number,
				duration: round.end_at
					? (new Date(round.end_at).getTime() -
							new Date(round.started_at).getTime()) /
						1000
					: null,
			},
			job_info: {
				title: job_description.title,
				description: job_description.description,
				requirements: job_description.jd_payload,
			},
			candidate_info: {
				name: candidate.name,
			},
			transcript,
			tool_results: toolResults,
		};
	}

	private async generateScoring(evaluationData: any): Promise<ScoringResult> {
		const scoringPrompt = this.buildScoringPrompt(evaluationData);

		const response = await this.openai.chat.completions.create({
			model: "gpt-4.1",
			messages: [
				{
					role: "system",
					content: `You are an expert technical interviewer and evaluator. Your task is to score a candidate's interview performance based on the transcript and tool results provided.

SCORING CRITERIA (Total = 100%):
- Technical Skills (30%): Problem-solving ability, coding skills, technical knowledge
- Communication (25%): Clarity, articulation, ability to explain concepts
- Reasoning (20%): Logical thinking, approach to problems, decision-making
- Creativity (15%): Innovative solutions, thinking outside the box
- Cultural Fit (10%): Alignment with company values, collaboration potential

SCORING SCALE:
- 90-100: Exceptional performance, clearly exceeds expectations
- 80-89: Strong performance, meets and often exceeds expectations
- 70-79: Good performance, meets most expectations
- 60-69: Adequate performance, meets basic expectations with some gaps
- 50-59: Below expectations, significant improvement needed
- 0-49: Poor performance, does not meet basic requirements

IMPORTANT: Your response must be a valid JSON object only. Do not include any markdown formatting, backticks, or additional text. Return only the JSON object with the following structure:
{
  "zero_score": number (0-100, overall weighted score),
  "score_components": {
    "technical_skills": number (0-100),
    "communication": number (0-100),
    "reasoning": number (0-100),
    "creativity": number (0-100),
    "cultural_fit": number (0-100)
  },
  "ai_summary": "string (20 - 30 words summary of performance)",
  "report_data": "string (This must be a JSON-stringified object containing detailed assessments. Format it as a stringified JSON object like this: \\"{\\\\\"technical_skills\\\\\": \\\\\"detailed assessment\\\\\", \\\\\"communication\\\\\": \\\\\"detailed assessment\\\\\", \\\\\"reasoning\\\\\": \\\\\"detailed assessment\\\\\", \\\\\"creativity\\\\\": \\\\\"detailed assessment\\\\\", \\\\\"cultural_fit\\\\\": \\\\\"detailed assessment\\\\\"}\\\")",
  "recommendations": ["array", "of", "improvement", "suggestions"]
}`,
				},
				{
					role: "user",
					content: scoringPrompt,
				},
			],
			temperature: 0.3,
			max_tokens: 3000,
		});

		const result = response?.choices[0]?.message?.content;
		if (!result) {
			throw new Error("No scoring result received from OpenAI");
		}

		try {
			// Clean the result to remove any markdown formatting or extra characters
			const cleanedResult = result
				.trim()
				.replace(/```json\n?/g, "")
				.replace(/```\n?/g, "");
			return JSON.parse(cleanedResult) as ScoringResult;
		} catch (parseError) {
			console.error("Failed to parse scoring result:", result);
			console.error("Parse error:", parseError);
			throw new Error("Invalid scoring result format");
		}
	}

	private buildScoringPrompt(data: any): string {
		return `
Please evaluate this interview performance:

INTERVIEW DETAILS:
- Round Type: ${data.round_info.type}
- Round Number: ${data.round_info.number}
- Duration: ${data.round_info.duration ? Math.round(data.round_info.duration / 60) : "N/A"} minutes

JOB REQUIREMENTS:
- Position: ${data.job_info.title}
- Description: ${data.job_info.description}
- Required Skills: ${data.job_info.requirements.skills ? data.job_info.requirements.skills.join(", ") : "Not specified"}
- Experience Level: ${data.job_info.requirements.experience || "Not specified"}

CANDIDATE: ${data.candidate_info.name}

CONVERSATION TRANSCRIPT:
${data.transcript
	.map(
		(msg: any, index: number) =>
			`${index + 1}. [${msg.role.toUpperCase()}] ${JSON.stringify(msg.content)}`,
	)
	.join("\n")}

TOOL RESULTS:
${
	data.tool_results.length > 0
		? data.tool_results
				.map(
					(result: any, index: number) =>
						`${index + 1}. Tool: ${result.tool}
   Input: ${JSON.stringify(result.input)}
   Output: ${JSON.stringify(result.output)}
   Success: ${result.passed ? "Yes" : "No"}`,
				)
				.join("\n\n")
		: "No tool results available"
}

Based on this information, provide a comprehensive evaluation following the scoring criteria and format specified.
`;
	}
}

export default new ScoringEngine();
