import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { USER_ROLE } from "@prisma/client";

const createJobPosting = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		const { title, description, jd_payload } = req.body;

		if (!title || !description || !jd_payload) {
			res.status(401).json({
				success: false,
				message: "Provide Valid Inputs",
			});
			return;
		}

		if (user.role !== USER_ROLE.recruiter) {
			res.status(401).json({
				success: false,
				message: "Your are not authorised to create Job Posting!",
			});
			return;
		}

		const job_posting = await prisma.job_description.create({
			data: {
				recruiter_id: user.id,
				title: title,
				description: description,
				jd_payload: jd_payload,
			},
		});

		if (!job_posting) {
			res.status(401).json({
				success: false,
				message: "Error creating Job Posting",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Job Posting created Successfully!",
		});
		return;
	} catch (error: any) {
		console.error("Error while creating job posting", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
		return;
	}
};

const getAllJobPosting = async (req: Request, res: Response) => {
	try {
		const user = req.user;
		let job_postings;
		if (user.role === USER_ROLE.candidate) {
			job_postings = await prisma.job_description.findMany({
				where: {
					candidate_applications: {
						none: {
							candidate_id: user.id,
						},
					},
					is_mock: false,
				},
				select: {
					title: true,
					description: true,
					id: true,
					recruiter: {
						select: {
							name: true,
						},
					},
				},
				orderBy: {
					created_at: 'desc'
				},
			});
		} else if (user.role === USER_ROLE.recruiter) {
			job_postings = await prisma.job_description.findMany({
				where: {
					recruiter_id: user.id,
					is_mock: false,
				},
				select: {
					title: true,
					description: true,
					id: true,
					recruiter: {
						select: {
							name: true,
						},
					},
					_count: {
						select: {
							candidate_applications: true
						}
					}
				},
				orderBy: {
					created_at: 'desc'
				},
				
			});
		} else if (user.role === USER_ROLE.admin) {
			job_postings = await prisma.job_description.findMany({
				select: {
					title: true,
					description: true,
					id: true,
					recruiter: {
						select: {
							name: true,
						},
					},
					is_mock: false,
				},
				orderBy: {
					created_at: 'desc'
				},
			});
		}

		if (!job_postings) {
			res.status(401).json({
				success: false,
				message: "No Job Postings Found!",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Job Postings!",
			data: job_postings,
		});
		return;
	} catch (error: any) {
		console.error("Error while getting all job postings", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
		return;
	}
};

const getJobPostingById = async (req: Request, res: Response) => {
	try {
		const { job_id } = req.query;

		if (!job_id) {
			res.status(403).json({
				success: false,
				message: "Job ID not Provided!",
			});
			return;
		}

		const job_posting = await prisma.job_description.findFirst({
			where: {
				id: job_id as string,
			},
			select: {
				title: true,
				description: true,
				id: true,
				jd_payload: true,
				recruiter: {
					select: {
						name: true,
						email: true,
					},
				},
				created_at: true,
			},
		});

		if (!job_posting) {
			res.status(401).json({
				success: false,
				message: "No Job Postings Found!",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Job Posting by ID!",
			data: job_posting,
		});
		return;
	} catch (error: any) {
		console.error("Error while getting job posting", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
		return;
	}
};

const updateJobPostingById = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		const { job_id, title, description, jd_payload } = req.body;

		if (!job_id) {
			res.status(403).json({
				success: false,
				message: "Job ID not Provided!",
			});
			return;
		}

		if (user.role !== USER_ROLE.recruiter) {
			res.status(401).json({
				success: false,
				message: "Your are not authorised to create Job Posting!",
			});
			return;
		}

		const job_posting = await prisma.job_description.update({
			where: {
				id: job_id as string,
				recruiter_id: user.id,
			},
			data: {
				title: title,
				description: description,
				jd_payload: jd_payload,
			},
		});

		if (!job_posting) {
			res.status(401).json({
				success: false,
				message: "Error updating Job Posting",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Job Posting updated Successfully!",
		});
		return;
	} catch (error: any) {
		console.error("Error while updating job posting", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const deleteJobPostingById = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		const { job_id } = req.query;

		if (!job_id) {
			res.status(403).json({
				success: false,
				message: "Job ID not Provided!",
			});
			return;
		}

		if (user.role !== USER_ROLE.recruiter) {
			res.status(401).json({
				success: false,
				message: "Your are not authorised to create Job Posting!",
			});
			return;
		}

		const job_posting = await prisma.job_description.delete({
			where: {
				id: job_id as string,
				recruiter_id: user.id,
			},
		});

		if (!job_posting) {
			res.status(401).json({
				success: false,
				message: "Error deleting Job Posting",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Job Posting deleted Successfully!",
		});
		return;
	} catch (error: any) {
		console.error("Error while deleting job posting", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const createMockJobPosting = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		const { title, description, jd_payload } = req.body;

		console.log(title, description, jd_payload);

		if (!title || !description || !jd_payload) {
			res.status(401).json({
				success: false,
				message: "Provide Valid Inputs",
			});
			return;
		}

		if(user.role !== USER_ROLE.admin) {
			res.status(401).json({
				success: false,
				message: "Your are not authorised to create Job Posting!",
			});
			return;
		}

		const job_posting = await prisma.job_description.create({
			data: {
				recruiter_id: user.id,
				title: title,
				description: description,
				jd_payload: jd_payload,
				is_mock: true,
			},
		});

		if (!job_posting) {
			res.status(401).json({
				success: false,
				message: "Error creating Mock Job Posting",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Mock Job Posting created Successfully!",
		});
	} catch (error: any) {
		console.error("Error while creating mock job posting", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
		return;
	}
};


const jobPostingController = {
	createJobPosting,
	getAllJobPosting,
	getJobPostingById,
	updateJobPostingById,
	deleteJobPostingById,
	createMockJobPosting,
};

export default jobPostingController;
