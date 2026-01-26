import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { INTERVIEW_ROUND_TYPE, JOB_APPLICATION_STATUS, USER_ROLE } from "@prisma/client";
import { createInterviewToken } from "../lib/interview-token";
import { getRoundSpecificInstructions, jobSpecificInstructions } from "../lib/round-specific-instruction";

const getMockInterviews = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		if(user.role === USER_ROLE.recruiter) {
			res.status(401).json({
				success: false,
				message: "Your are not authorised to get Mock Job Posting!",
			});
			return;
		}

		const job_postings = await prisma.job_description.findMany({
			where: {
				is_mock: true,
			},
			select: {
				title: true,
				description: true,
				id: true,
			},
			orderBy: {
				created_at: 'desc'
			},
		});

		if (!job_postings) {
			res.status(401).json({
				success: false,
				message: "No Mock Job Postings Found!",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Mock Job Postings!",
			data: job_postings,
		});
		return;

	} catch (error: any) {
		console.error("Error while getting mock job posting", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
		return;
	}
}

const startMockInterview = async (req: Request, res: Response) => {
	const { mock_job_id } = req.body; 
	const { id: candidate_id } = req.user;
	
	try {
		// 1. auto create job application
		const application = await prisma.job_application.create({
			data: {
				candidate_id,
				job_description_id: mock_job_id as string,
				status: JOB_APPLICATION_STATUS.in_progress,
			}, 
			select: {
				id: true,
				candidate_id: true,
				job_description_id: true,
				job_description: {
					select: {
						recruiter_id: true,
						title: true,
						description: true,
						jd_payload: true,
						recruiter: {
							select: {
								name: true,
							}
						}
					}
				},
				candidate: {
					select: {
						name: true,
					}
				}
			}
		});

		// 2. auto create interview sessions
		const session = await prisma.interview_session.create({
			data: {
				application_id: application.id
			}
		});

		// 3. auto create interview round 
		const round = await prisma.interview_round.create({
			data: {
				session_id: session.id,
				round_number: 1,
				round_type: INTERVIEW_ROUND_TYPE.skill_assessment,
				status: 'pending',
				started_at: new Date(),
			}
		});

		// 4. generate interview token and return 

		const tokenPayload = {
			candidate_id: application.candidate_id,
			recruiter_id: application.job_description.recruiter_id,
			job_description_id: application.job_description_id,
			application_id: application.id,
			interview_session_id: session.id,
			interview_round_id: round.id,
			round_type: round.round_type,
			round_number: round.round_number,
			type: 'interview_invitation' as const,
			title: application.job_description.title,
			candidate_name: application.candidate.name,
			recruiter_name: application.job_description.recruiter.name,
			description: application.job_description.description,
			jd_skills: (application.job_description.jd_payload as any)?.skills || "",
			jd_experience: (application.job_description.jd_payload as any)?.experience || "",
			jd_location: (application.job_description.jd_payload as any)?.location || "",
			round_specific_instructions: getRoundSpecificInstructions(round.round_type as INTERVIEW_ROUND_TYPE),
			job_specific_instructions: jobSpecificInstructions(application.job_description.title),
		}

		const interview_token = createInterviewToken(tokenPayload, "24h");

		const interview_link = `${process.env.FRONTEND_URL}/interview?token=${interview_token}`;

		res.status(200).json({
			success: true,
			interview_token: interview_token,
			interview_token_payload: tokenPayload,
			round_id: round.id,
			redirect_url: interview_link,
		})

	} catch (error: any) {
		console.error("Error while starting mock interview", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
		return;
	}
}

const getMockInterviewDetailsAndAttempts = async (req: Request, res: Response) => {
	const { id: candidate_id } = req.user; 
	const { mock_job_id } = req.query;

	try {

		// 1. get mock job details
		const mock_job = await prisma.job_description.findUnique({
			where: {
				id: mock_job_id as string,
				is_mock: true,
			},
		})

		if(!mock_job) {
			res.status(401).json({
				success: false,
				message: "Mock job not found",
			});
			return;
		}

		// 2. get all attempts for the mock job
		const attempts = await prisma.job_application.findMany({
			where: {
				job_description_id: mock_job_id as string,
				candidate_id: candidate_id,
			},
			select: {
				id: true,
				job_description_id: true, 
				created_at: true, 
				status: true, 
				interview_session: {
					select: {
						id: true,
						interview_round: {
							select: {
								id: true,
								zero_score: true,
								ai_summary: true, 
								round_number: true, 
								round_type: true, 
							}
						}
					}
				}
			},
			orderBy: {
				created_at: 'desc'
			}
		})


		res.status(200).json({
			success: true,
			message: "Mock interview details and attempts",
			data: {
				mock_job,
				attempts,
			}
		})
		return;
	} catch (error) {
		console.error("Error while getting mock interview details and attempts", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
		return;
	}



}

const getReport = async (req: Request, res: Response) => {
	const { id: candidate_id } = req.user; 
	const { round_id } = req.query;
	
	try {
		if (!round_id) {
			res.status(400).json({
				success: false,
				message: "Round ID is required",
			});
			return;
		}

	// 2. get round report 
	const detailedReport = await prisma.interview_round.findUnique({
		where: {
			id: round_id as string,
			session: {
				application: {
					candidate_id: candidate_id,
				}
			}
		}, 
		select: {
			zero_score: true,
			score_components: true,
			ai_summary: true,
			report_data: true,
			report_generated_at: true,
			recruiter_decision: true,
		}
	})
	
	res.status(200).json({
		success: true,
		message: "Report fetched successfully for round",
		report: detailedReport,
	})
	return;

	} catch (error) {
		console.error("Error while getting mock interview details and attempts", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
		return;
	}
}

const getMyReports = async (req: Request, res: Response) => {
	const { id: candidate_id } = req.user;

	try {
		// 1. get all attempts for the candidate
		const attempts = await prisma.job_application.findMany({
			where: {
				candidate_id: candidate_id,
				status: JOB_APPLICATION_STATUS.completed,
				job_description: {
					is_mock: true,
				}
			}, 
			select: {
				id: true,
				job_description_id: true,
				created_at: true,
				status: true,
				interview_session: {
					select: {
						interview_round: {
							select: {
								id: true,
								zero_score: true,
								ai_summary: true,
								round_number: true,
								round_type: true,
								report_data: true,
								report_generated_at: true,
								recruiter_decision: true,
							}
						}
					}
				}
			}
		})

		res.status(200).json({
			success: true,
			message: "My reports",
			data: attempts,
		})
		return;

	} catch (error) {
		console.error("Error while getting my reports", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
		return;
	}
}

export const mockInterviewController = {
	getMockInterviews,
	startMockInterview,
	getMockInterviewDetailsAndAttempts,
	getReport,
	getMyReports,
}