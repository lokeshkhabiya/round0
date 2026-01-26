import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import scoringEngine from "../services/scoring-engine";
import { INTERVIEW_ROUND_STATUS } from "@prisma/client";
import s3Service from "../services/s3-service";
import axios from "axios";

const verifyInterview = async (req: Request, res: Response) => {
	try {
		const { interview_round_id } = req.interview_token;

		const verify_interview_round = await prisma.interview_round.findFirst({
			where: {
				id: interview_round_id,
				status: "pending",
			},
		});

		if (!verify_interview_round) {
			res.status(400).json({
				success: false,
				message: "Interview round not found or already started",
			});
			return;
		}

		const updated_interview_round = await prisma.interview_round.update({
			where: {
				id: verify_interview_round.id,
			},
			data: {
				started_at: new Date(),
				end_at: new Date(new Date().getTime() + 1000 * 60 * 30),
				status: "started",
			},
		});

		const interview_token_payload = {
			candidate_id: req.interview_token.candidate_id,
			recruiter_id: req.interview_token.recruiter_id,
			job_description_id: req.interview_token.job_description_id,
			application_id: req.interview_token.application_id,
			interview_session_id: req.interview_token.interview_session_id,
			interview_round_id: req.interview_token.interview_round_id,
			round_type: req.interview_token.round_type,
			round_number: req.interview_token.round_number,
    		type: 'interview_invitation' as const,
			title: req.interview_token.title,
			candidate_name: req.interview_token.candidate_name,
			recruiter_name: req.interview_token.recruiter_name,
			description: req.interview_token.description,
			jd_skills: req.interview_token.jd_skills,
			jd_experience: req.interview_token.jd_experience,
			jd_location: req.interview_token.jd_location,
			round_specific_instructions: req.interview_token.round_specific_instructions,
		}		

		return res.status(200).json({
			success: true,
			message: "Interview round started",
			round_id: updated_interview_round.id,
			data: interview_token_payload,
			
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const endInterview = async (req: Request, res: Response) => {
	try {
		const { round_id } = req.body;
		const { interview_round_id } = req.interview_token;

		if (round_id !== interview_round_id) {
			res.status(400).json({
				success: false,
				message: "Round ID mismatch",
			});
			return;
		}

		// Update round status to ended
		await prisma.interview_round.update({
			where: { id: round_id },
			data: {
				status: INTERVIEW_ROUND_STATUS.completed,
				end_at: new Date()
			}
		});

		// Trigger scoring engine after a delay
		setTimeout(async () => {
			try {
				await scoringEngine.scoreRound(round_id);
				console.log("Scoring engine completed");
			} catch (error) {
				console.error("Scoring engine error", error);
			}
		}, 10000);

		res.status(200).json({
			success: true,
			message: "Interview ended successfully",
		});
		return;
	} catch (error) {
		console.error("Error ending interview round", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const getRoundTranscript = async (req: Request, res: Response) => {
	try {
		const { round_id } = req.params;

		if (!round_id) {
			res.status(400).json({
				success: false,
				message: "Round ID is required",
			});
			return;
		}

		const messages = await prisma.message.findMany({
			where: {
				round_id: round_id as string,
			},

			orderBy: {
				created_at: "asc",
			},

			select: {
				id: true,
				messenger_role: true,
				content: true,
				message_type: true,
				created_at: true,
			},
		});

		if (!messages || messages.length === 0) {
			res.status(400).json({
				success: false,
				message: "No messages found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Round transcript fetched successfully",
			data: messages,
		});
		return;
	} catch (error) {
		console.log("Error while getting round transcript: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// TODO: fix role based get report
const getRoundReport = async (req: Request, res: Response) => {
	try {
		const { role } = req.user;
		const { round_id } = req.params;
		const { interview_round_id } = req.interview_token;

		if (round_id !== interview_round_id) {
			res.status(400).json({
				success: false,
				message: "round id mismatch",
			});
		}

		const round = await prisma.interview_round.findUnique({
			where: {
				id: round_id as string,
			},

			select: {
				zero_score: true,
				score_components: true,
				ai_summary: true,
				report_generated_at: true,
				status: true,
			},
		});

		if (!round) {
			res.status(400).json({
				success: false,
				message: "Round not found",
			});
			return;
		}

		if (round.status !== "completed" || !round.report_generated_at) {
			res.status(400).json({
				success: false,
				message: "Round not completed or report not generated",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Round report fetched successfully",
			data: round,
		});
		return;
	} catch (error) {
		console.log("Error while getting round report: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const evaluateCanvas = async (req: Request, res: Response) => {
	try {
		const body = req.body;

		if (!body.question || !body.canvasData || !body.canvasImage) {
			res.status(400).json({
				success: false,
				message: "Missing required fields",
			});
			return;
		}

		const prompt = `You are an expert system design interviewer evaluating a candidate's system design solution. 

TASK: Evaluate the provided system design canvas and provide a score with brief feedback.

QUESTION: ${body.question}

CANVAS DATA: The canvas contains the following elements and relationships:
${JSON.stringify(body.canvasData, null, 2)}

CANVAS IMAGE: ${body.canvasImage}

EVALUATION CRITERIA:
1. **Architecture Completeness (25%)**: Does the design include all necessary components (load balancers, databases, caches, services, etc.)?
2. **Scalability & Performance (25%)**: How well does the design handle scale? Are there appropriate scaling strategies?
3. **System Design Best Practices (25%)**: Are industry standards followed? Proper use of microservices, data flow, etc.?
4. **Problem Solving & Trade-offs (25%)**: Does the candidate demonstrate understanding of trade-offs and alternative approaches?

RESPONSE FORMAT:
You must respond with ONLY a valid JSON object in this exact format:
{
  "score": <number between 0-100>,
  "summary": "<2-3 sentence summary highlighting key strengths and areas for improvement>"
}

Do not include any markdown formatting, code blocks, or additional text outside the JSON object.`;

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-5-mini",
				messages: [{ role: "user", content: prompt }],
			}),
		});

		const data = await response.json();

		// @ts-ignore
		let ai_response = data?.choices[0].message.content;

		// Clean the response to extract JSON
		ai_response = ai_response.trim();

		// Remove markdown code blocks if present
		if (ai_response.startsWith("```")) {
			const firstNewline = ai_response.indexOf("\n");
			const lastCodeBlock = ai_response.lastIndexOf("```");
			ai_response = ai_response
				.substring(firstNewline + 1, lastCodeBlock)
				.trim();
		}

		const ai_response_json = JSON.parse(ai_response);

		res.status(200).json({
			success: true,
			message: "Canvas evaluation completed successfully",
			data: ai_response_json,
		});
		return;
	} catch (error) {
		console.log("Error while evaluating canvas: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const evaluateCode = async (req: Request, res: Response) => {
	try {
		const body = req.body;

		if (!body.code || !body.language || !body.question) {
			res.status(400).json({
				success: false,
				message: "Missing required fields",
			});
			return;
		}

		const prompt = `You are an expert code evaluator and technical interviewer with extensive experience in software engineering best practices. 

TASK: Thoroughly evaluate the candidate's code submission for a technical interview. Assess code quality, correctness, efficiency, and adherence to best practices.

QUESTION/PROBLEM: ${body.question}
CANDIDATE'S CODE SOLUTION:
\`\`\`${body.language}
${body.code}
\`\`\`

EVALUATION CRITERIA:
- Correctness: Does the code solve the given problem correctly?
- Code Quality: Is the code well-structured, readable, and maintainable?
- Efficiency: Are appropriate algorithms and data structures used?
- Best Practices: Does the code follow language-specific conventions and best practices?
- Error Handling: Are edge cases and potential errors considered?
- Completeness: Is the solution complete and production-ready?

RESPONSE FORMAT:
You must respond with ONLY a valid JSON object in this exact format:
{
  "score": <number between 0-100>,
  "summary": "<3-4 sentence comprehensive summary covering correctness, code quality, efficiency, strengths, areas for improvement, and overall assessment>"
}

Do not include any markdown formatting, code blocks, or additional text outside the JSON object.`;

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-5-mini",
				messages: [{ role: "user", content: prompt }],
			}),
		});

		const data = await response.json();

		// @ts-ignore
		let ai_response = data?.choices[0].message.content;

		// Clean the response to extract JSON
		ai_response = ai_response.trim();

		// Remove markdown code blocks if present
		if (ai_response.startsWith("```")) {
			const firstNewline = ai_response.indexOf("\n");
			const lastCodeBlock = ai_response.lastIndexOf("```");
			ai_response = ai_response
				.substring(firstNewline + 1, lastCodeBlock)
				.trim();
		}

		const ai_response_json = JSON.parse(ai_response);

		res.status(200).json({
			success: true,
			message: "Code sent for evaluation successfully",
			data: ai_response_json,
		});
		return;
	} catch (error) {
		console.log("Error while evaluating code: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const getAgentUrl = async (req: Request, res: Response) => {
	try {
		const { round_id } = req.body;
		const { interview_round_id } = req.interview_token;

		if (round_id !== interview_round_id) {
			res.status(400).json({
				success: false,
				message: "Round ID mismatch",
			});
			return;
		}

		// Check if ElevenLabs API key is configured
		if (!process.env.ELEVENLABS_API_KEY) {
			res.status(500).json({
				success: false,
				message: "ElevenLabs API key not configured",
			});
			return;
		}

		// Check if agent ID is configured
		if (!process.env.ELEVENLABS_AGENT_ID) {
			res.status(500).json({
				success: false,
				message: "ElevenLabs agent ID not configured",
			});
			return;
		}

		try {
			// Get signed URL from ElevenLabs
			const response = await fetch(
				`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${process.env.ELEVENLABS_AGENT_ID}`,
				{
					method: "GET",
					headers: {
						"xi-api-key": process.env.ELEVENLABS_API_KEY,
					},
				}
			);

			if (!response.ok) {
				throw new Error(`ElevenLabs API error: ${response.status}`);
			}

			const data = await response.json() as { signed_url: string };

			res.status(200).json({
				success: true,
				message: "Agent URL retrieved successfully",
				signed_url: data.signed_url,
			});
			return;
		} catch (elevenLabsError) {
			console.error("ElevenLabs API error:", elevenLabsError);
			res.status(500).json({
				success: false,
				message: "Failed to get signed URL from ElevenLabs",
			});
			return;
		}
	} catch (error) {
		console.error("Error getting agent URL:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const uploadRecording = async (req: Request, res: Response) => {
	try {
		const { round_id } = req.params;
		const { interview_round_id } = req.interview_token;

		if (round_id !== interview_round_id) {
			res.status(403).json({
				success: false,
				message: "Round ID mismatch.",
			});
			return;
		}

		if (!req.file) {
			res.status(400).json({
				success: false,
				message: "No recording file provided.",
			});
			return;
		}

		const bucketName = process.env.AWS_BUCKET_NAME;
		if (!bucketName) {
			console.error("AWS_BUCKET_NAME is not set.");
			res.status(500).json({
				success: false,
				message: "Server configuration error: S3 bucket name not set.",
			});
			return;
		}

		const key = `recordings/recording-video/${round_id}-${Date.now()}.webm`;

		const recordingUrl = await s3Service.uploadFile(
			bucketName,
			key,
			req.file.buffer,
			req.file.mimetype
		);

		const round = await prisma.interview_round.findUnique({
			where: {
				id: round_id as string
			},
			select: {
				session_id: true
			}
		})

		const addingRecordingInSession = await prisma.session_recording.upsert({
			where: {
				session_id_round_id: {
					session_id: round?.session_id as string,
					round_id: round_id as string
				}
			}, 
			update: {
				urls: {
					push: recordingUrl
				}
			},
			create: {
				session_id: round?.session_id as string,
				round_id: round_id as string,
				urls: [recordingUrl]
			}
		})

		res.status(200).json({
			success: true,
			message: "Recording uploaded successfully.",
			data: { recordingUrl },
		});
		return;

	} catch (error) {
		console.error("Error uploading recording:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error while uploading recording.",
		});
		return;
	}
}
export const saveMessage = async (req: Request, res: Response) => {
	try {
		const { interview_round_id } = req.interview_token;
		const { messenger_role, content, message_type, audio_url, conversation_id } = req.body;

		// Validate round exists and belongs to the authenticated user
		const round = await prisma.interview_round.findFirst({
			where: {
				id: interview_round_id,
				status: "started"
			}
		});

		if (!round) {
			return res.status(404).json({
				success: false,
				message: "Interview round not found or not active"
			});
		}

		// Save message to database
		const message = await prisma.message.create({
			data: {
				round_id: interview_round_id,
				messenger_role,
				content,
				message_type,
				conversation_id: conversation_id
			}
		});

		res.status(201).json({
			success: true,
			message: "Message saved successfully",
			data: message
		});
	} catch (error) {
		console.error("Error saving message:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error"
		});
	}
};

export const saveToolResult = async (req: Request, res: Response) => {
	try {
		const { interview_round_id } = req.interview_token;
		const { tool_name, input_data, output_data, passed, metadata } = req.body;

		const toolResult = await prisma.tool_result.create({
			data: {
				round_id: interview_round_id,
				tool_name,
				input_data,
				output_data,
				passed: passed || null,
				metadata: metadata || null
			}
		});

		res.status(201).json({
			success: true,
			message: "Tool result saved successfully",
			data: toolResult
		});
	} catch (error) {
		console.error("Error saving tool result:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error"
		});
	}
};

export const interviewController = {
	verifyInterview,
	endInterview,
	getRoundTranscript,
	getRoundReport,
	evaluateCanvas,
	evaluateCode,
	getAgentUrl,
	uploadRecording,
	saveMessage,
	saveToolResult,
};
