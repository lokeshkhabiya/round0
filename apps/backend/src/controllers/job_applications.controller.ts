import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { INTERVIEW_ROUND_TYPE, USER_ROLE } from "@prisma/client";
import { createInterviewToken } from "../lib/interview-token";
import emailService from "../services/email-service";
import { getRoundSpecificInstructions, jobSpecificInstructions } from "../lib/round-specific-instruction";

const applyForJob = async (req: Request, res: Response) => {
    try {
        const { job_id } = req.body;
        const { role, id: candidate_id } = req.user;

        if (role !== USER_ROLE.candidate) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: Only candidates can apply for jobs!",
            });
            return;
        }

        const job = await prisma.job_description.findUnique({
            where: {
                id: job_id,
            },
        });

        if (!job) {
            res.status(404).json({
                success: false,
                message: "Job not found",
            });
            return;
        }

        const existingApplication = await prisma.job_application.findFirst({
            where: {
                candidate_id,
                job_description_id: job_id,
            },
        });

        if (existingApplication) {
            res.status(203).json({
                success: false,
                message: "Application already exists for this job",
            });
            return;
        }

        const application = await prisma.job_application.create({
            data: {
                candidate_id,
                job_description_id: job_id,
            },
        });

        res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: application,
        });
    } catch (error) {
        console.error("Error while applying for a job", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getApplicationsForJob = async (req: Request, res: Response) => {
    try {
        const { job_id } = req.query;
        const { role, id: recruiter_id } = req.user;

        if (role !== USER_ROLE.recruiter) {
            res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Only recruiters can get applications for a job!",
            });
            return;
        }

        const job = await prisma.job_description.findUnique({
            where: {
                id: job_id as string,
                recruiter_id,
            },

            select: {
                title: true,
                description: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!job) {
            res.status(404).json({
                success: false,
                message: "Job not found",
            });
            return;
        }

        const applications = await prisma.job_application.findMany({
            where: {
                job_description_id: job_id as string,
                status: {
                    in: ["pending", "invited"],
                },
            },

            include: {
                candidate: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        imageUrl: true,
                    },
                },
            },

            omit: {
                created_at: true,
                updated_at: true,
            },
        });

        const statusCounts = await prisma.job_application.groupBy({
            by: ["status"],
            where: {
                job_description_id: job_id as string,
            },
            _count: {
                status: true,
            },
        });

        const pendingCount =
            statusCounts.find((item) => item.status === "pending")?._count
                .status || 0;
        const invitedCount =
            statusCounts.find((item) => item.status === "invited")?._count
                .status || 0;
        const applicationsCount = statusCounts.reduce(
            (total, item) => total + item._count.status,
            0
        );

        res.status(200).json({
            success: true,
            message: "Applications fetched successfully",
            job,
            count: applicationsCount,
            pendingCount,
            invitedCount,
            data: applications,
        });
    } catch (error) {
        console.error("Error while getting applications for a job", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error,
        });
    }
};

const getApplicationsByCandidate = async (req: Request, res: Response) => {
    try {
        const { role, id: candidate_id } = req.user;

        if (role !== USER_ROLE.candidate) {
            res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Only candidates can get their applications!",
            });
            return;
        }

        const applications = await prisma.job_application.findMany({
            where: {
                candidate_id,
            },

            include: {
                job_description: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    },
                },
            },
            orderBy : {
                created_at : "desc"
            }
        });

        res.status(200).json({
            success: true,
            message: "Applications fetched successfully",
            data: applications,
        });
    } catch (error) {
        console.error("Error while getting applications by a candidate", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error,
        });
    }
};

const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const { application_id, status } = req.body;
        const { role, id: recruiter_id } = req.user;

        if (role !== USER_ROLE.recruiter) {
            res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Only recruiters can update application status!",
            });
            return;
        }

        const application = await prisma.job_application.findUnique({
            where: {
                id: application_id as string,
                job_description: {
                    recruiter_id,
                },
            },
        });

        if (!application) {
            res.status(404).json({
                success: false,
                message: "Application not found",
            });
            return;
        }

        const updatedApplication = await prisma.job_application.update({
            where: {
                id: application_id as string,
            },
            data: {
                status,
            },
        });

        res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            data: updatedApplication,
        });
    } catch (error) {
        console.error("Error while updating application status", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error,
        });
    }
};

// TODO: fix failed emails situation
const inviteCandidate = async (req: Request, res: Response) => {
    try {
        const { job_id, round_number, round_type } = req.body;
        const { role, id: recruiter_id } = req.user;

        if (role !== USER_ROLE.recruiter) {
            res.status(401).json({
                success: false,
                message: "Unauthorized: Only recruiters can invite candidates!",
            });
            return;
        }

        const job = await prisma.job_description.findUnique({
            where: {
                id: job_id,
                recruiter_id,
            },

            select: {
                id: true,
                title: true,
                description: true,
                jd_payload: true,
                recruiter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!job) {
            res.status(404).json({
                success: false,
                message: "Job not found",
            });
            return;
        }

        if (round_number == 1 && round_type === "skill_assessment") {
            const invitedApplications = await prisma.job_application.findMany({
                where: {
                    job_description_id: job_id,
                    status: "invited",
                },

                include: {
                    candidate: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            if (invitedApplications.length == 0) {
                res.status(203).json({
                    success: false,
                    message: "No candidate found to invite for this job",
                });
                return;
            }

            const emailPromises = invitedApplications.map(
                async (application) => {
                    const interview_session =
                        await prisma.interview_session.create({
                            data: {
                                application_id: application.id,
                            },
                        });

                    const interview_round = await prisma.interview_round.create(
                        {
                            data: {
                                session_id: interview_session.id,
                                round_number: 1,
                                round_type: "skill_assessment",
                            },
                        }
                    );

                    const tokenPayload = {
                        candidate_id: application.candidate_id,
                        recruiter_id,
                        job_description_id: job_id,
                        application_id: application.id,
                        interview_session_id: interview_session.id,
                        interview_round_id: interview_round.id,
                        round_type: interview_round.round_type,
                        round_number: interview_round.round_number,
                        type: "interview_invitation" as const,
                        title: job.title,
                        candidate_name: application.candidate.name,
                        recruiter_name: job.recruiter.name,
                        description: job.description,
                        jd_skills: (job.jd_payload as any)?.skills || "",
                        jd_experience:
                            (job.jd_payload as any)?.experience || "",
                        jd_location: (job.jd_payload as any)?.location || "",
                        round_specific_instructions: getRoundSpecificInstructions(interview_round.round_type as INTERVIEW_ROUND_TYPE),
						job_specific_instructions: jobSpecificInstructions(job.title),
                    };

                    const interviewToken = createInterviewToken(
                        tokenPayload,
                        "24h"
                    );
                    const interviewLink = `${process.env.FRONTEND_URL}/interview?token=${interviewToken}`;

                    // send individual email
                    return emailService.sendSingleInterviewInvitation(
                        application.candidate.email,
                        application.candidate.name,
                        job.title,
						round_type,
                        interviewLink
                    );
                }
            );

            const emailResults = await Promise.all(emailPromises);

            const successfulEmails = emailResults.filter(
                (result) => result === true
            ).length;

            if (successfulEmails > 0) {
                await prisma.job_application.updateMany({
                    where: {
                        job_description_id: job_id,
                        status: "invited",
                    },
                    data: {
                        status: "in_progress",
                    },
                });

                res.status(200).json({
                    success: true,
                    message: "Interview invitations sent successfully",
                    data: {
                        totalInvited: invitedApplications.length,
                        successfulEmails: successfulEmails,
                        failedEmails:
                            invitedApplications.length - successfulEmails,
                    },
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Interview invitations failed to send",
                });
            }
        } else if (round_number == 2 && round_type === "behavioral") {
			
			const inProgressApplications = await prisma.interview_session.findMany({
				where: {
					application: {
						job_description_id: job_id,
						status: "in_progress",
					}, 

					interview_round: {
						some: {
							round_number: 1, 
							round_type: "skill_assessment",
							status: "completed",
							recruiter_decision: "pass",
                        },
						none: {
							round_number: 2,
							round_type: "behavioral"
						},
                    },
                },

				select: {
					id: true,
					application_id: true,
					application: {
						select: {
							candidate_id: true, 
							candidate: {
								select: {
									name: true,
									email: true,
								}
							}
						}
					}
				}
            });

			if (inProgressApplications.length == 0) {
				res.status(203).json({
					success: false,
					message: "No candidate found to invite for this job",
				});
				return;
			}

			const emailPromises = inProgressApplications.map(async (session) => {
				const interview_round = await prisma.interview_round.create({
					data: {
						session_id: session.id as string, 
						round_number: 2,
						round_type: "behavioral",
                    },
                });

				const tokenPayload = {
					candidate_id: session.application.candidate_id,
					recruiter_id,
					job_description_id: job_id,
					application_id: session.application_id,
					interview_session_id: session.id as string,
					interview_round_id: interview_round.id,
					round_type: interview_round.round_type,
					round_number: interview_round.round_number,
					type: "interview_invitation" as const,
					title: job.title,
					candidate_name: session.application.candidate.name,
					recruiter_name: job.recruiter.name,
					description: job.description,
					jd_skills: (job.jd_payload as any)?.skills || "",
					jd_experience: (job.jd_payload as any)?.experience || "",
					jd_location: (job.jd_payload as any)?.location || "",
					round_specific_instructions: getRoundSpecificInstructions(interview_round.round_type as INTERVIEW_ROUND_TYPE),
					job_specific_instructions: jobSpecificInstructions(job.title),
				}	

				const interviewToken = createInterviewToken(tokenPayload, "24h");
				const interviewLink = `${process.env.FRONTEND_URL}/interview?token=${interviewToken}`;

				return emailService.sendSingleInterviewInvitation(
					session.application.candidate.email,
					session.application.candidate.name,
					job.title,
					round_type,
					interviewLink
				);
			});

			const emailResults = await Promise.all(emailPromises);

			const successfulEmails = emailResults.filter(
				(result) => result === true
			).length;

			res.status(200).json({
				success: true,
				message: "Interview invitations sent successfully",
				data: {
					totalInvited: inProgressApplications.length,
					successfulEmails: successfulEmails,
					failedEmails: inProgressApplications.length - successfulEmails,
				}
			})
		} else {
			res.status(500).json({
				success: false,
				message: "Interview invitations failed to send",
			});
		}
    } catch (error) {
        console.error("Error while inviting a candidate", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error,
        });
    }
};

const getApplicationsShortlisted = async (req: Request, res: Response) => {
    try {
        const { job_id, round_number, round_type } = req.query;
        const { role, id: recruiter_id } = req.user;

        if (role !== USER_ROLE.recruiter) {
            res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Only recruiters can get shortlisted candidates for skill simulation!",
            });
            return;
        }

        // Get interview sessions with application details where job applications are in progress and have the specified round
        const filteredApplications = await prisma.interview_session.findMany({
            where: {
                application: {
                    job_description_id: job_id as string,
                    status: "in_progress",
                },

                interview_round: {
                    some: {
                        round_number: parseInt(round_number as string),
                        round_type: round_type as INTERVIEW_ROUND_TYPE,
						recruiter_decision: "pending",
                    },
                },
            },

            select: {
                application: {
                    select: {
                        candidate: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                imageUrl: true,
                            },
                        },
                    },
                },

                interview_round: {
                    where: {
                        round_number: parseInt(round_number as string),
                        round_type: round_type as INTERVIEW_ROUND_TYPE,
                    },
                    select: {
                        id: true,
                        session_id: true,
                        round_number: true,
                        round_type: true,
                        status: true,
                        started_at: true,
                        end_at: true,
                        zero_score: true,
                        ai_summary: true,
                        recruiter_decision: true,
                    },
                },
            },
        });

        // count of interview rounds by status
        const countInterviewRoundByStatus = filteredApplications.reduce(
            (acc, item) => {
                const round = item.interview_round[0];
                if (round?.status === "completed") {
                    acc.completed++;
                } else if (round?.status === "pending") {
                    acc.pending++;
                } else if (round?.status === "started") {
                    acc.started++;
                } else if (round?.status === "error") {
                    acc.error++;
                }
                return acc;
            },
            { completed: 0, pending: 0, started: 0, error: 0 }
        );

        res.status(200).json({
            success: true,
            message: "Shortlisted candidates fetched successfully",
            data: filteredApplications,
            count: filteredApplications.length,
            countInterviewRoundByStatus,
        });
    } catch (error) {
        console.error(
            "Error while getting shortlisted candidates for round 1",
            error
        );
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error,
        });
    }
};

const updateRecruiterDecision = async (req: Request, res: Response) => {
    try {
        const { interview_round_id, decision } = req.body;
        const { role, id: recruiter_id } = req.user;

        if (role !== USER_ROLE.recruiter) {
            res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Only recruiters can update recruiter decisions!",
            });
            return;
        }

        // Validate decision
        if (!["pending", "pass", "fail"].includes(decision)) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid decision. Must be one of: pending, pass, fail",
            });
            return;
        }

        // Update the interview round with recruiter decision
        const updatedRound = await prisma.interview_round.update({
            where: {
                id: interview_round_id,
            },
            data: {
                recruiter_decision: decision,
                decision_at: new Date(),
            },
            select: {
                id: true,
                recruiter_decision: true,
                session_id: true,
                round_number: true,
                round_type: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "Recruiter decision updated successfully",
            data: updatedRound,
        });
    } catch (error) {
        console.error("Error while updating recruiter decision", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error,
        });
    }
};

const jobApplicationsController = {
    applyForJob,
    getApplicationsForJob,
    getApplicationsByCandidate,
    updateApplicationStatus,
    inviteCandidate,
    getApplicationsShortlisted,
    updateRecruiterDecision,
};

export default jobApplicationsController;
