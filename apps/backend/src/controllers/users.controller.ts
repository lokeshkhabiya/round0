import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { USER_ROLE } from "@prisma/client";

const getUser = async (req: Request, res: Response) => {
	try {
		const { candidate_id } = req.query;
		const { role, id: recruiter_id } = req.user;

		if (role !== USER_ROLE.recruiter) {
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only recruiters can get users details!",
			});
			return;
		}

		const user = await prisma.user.findUnique({
			where: {
				id: candidate_id as string,
				role: USER_ROLE.candidate,
			},
		});

		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "User details fetched successfully",
			data: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		console.error("Error while getting users", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
};

const getAllUsers = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		if (user.role === USER_ROLE.candidate) {
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only recruiters can get users details!",
			});
			return;
		}

		const users = await prisma.user.findMany({
			where: {
				role: USER_ROLE.candidate,
			},
			select: {
				id: true,
				name: true,
				email: true,
				_count: {
					select: {
						candidate_applications: true,
					},
				},
			},
		});

		if (users.length === 0) {
			res.status(401).json({
				success: false,
				message: "No Candidates found!",
			});
			return;
		}

		res.json({
			success: true,
			message: "Candidates retrived succesfully!",
			data: users,
		});
	} catch (error: any) {
		console.error("Error while getting users", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
};

const getCandidate =async (req: Request, res: Response) => {
	try {
		const user = req.user;

		const { candidate_id } = req.query;

		if(user.role !== USER_ROLE.admin){
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only admin can get candidate details!",
			});
			return;
		}

		const candidate = await prisma.user.findUnique({
			where : {
				id : candidate_id as string,
			},
			select : {
				id : true,
				email : true,
				name : true,
				role : true,
				_count : {
					select : {
						candidate_applications : true
					}
				},
				candidate_applications : {
					select : {
						status : true,
						job_description : {
							select : {
								id : true,
								title : true,
								description : true
							}
						},
						interview_session : {
							select : {
								interview_round : {
									select : {
										id : true,
										round_number : true,
										round_type : true,
										status : true,
									},
									orderBy : {
										created_at : "asc"
									}
								}
							},
							
						}
					

					},	
				},
			}
		})

		if(!candidate){
			res.status(401).json({
				success: false,
				message: "Candidate not Found!",
			});
			return;
		}

		res.status(203).json({
			success : true,
			message : "Candidate Fetched Successfully!",
			data : candidate
		})


	} catch (error : any) {
		console.error("Error while getting candidate", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
}


const getCandidateProfile = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		if (user.role !== USER_ROLE.candidate) {
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only candidates can access their profile!",
			});
			return;
		}

		const candidateProfile = await prisma.candidate_profile.findUnique({
			where: {
				candidate_id: user.id,
			},
		});

		res.status(200).json({
			success: true,
			message: candidateProfile ? "Candidate profile fetched successfully" : "No profile found",
			data: candidateProfile,
		});
	} catch (error: any) {
		console.error("Error while getting candidate profile", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
};

const createCandidateProfile = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		if (user.role !== USER_ROLE.candidate) {
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only candidates can create their profile!",
			});
			return;
		}

		// Check if profile already exists
		const existingProfile = await prisma.candidate_profile.findUnique({
			where: {
				candidate_id: user.id,
			},
		});

		if (existingProfile) {
			res.status(400).json({
				success: false,
				message: "Candidate profile already exists!",
			});
			return;
		}

		const {
			name,
			email,
			phone,
			location,
			linkedin_url,
			github_url,
			portfolio_url,
			resume_url,
			skills,
			experience,
			education,
			certifications,
			projects,
			achievements,
			interests,
		} = req.body;

		const candidateProfile = await prisma.candidate_profile.create({
			data: {
				candidate_id: user.id,
				name,
				email,
				phone,
				location,
				linkedin_url,
				github_url,
				portfolio_url,
				resume_url,
				skills: skills || [],
				experience: experience || [],
				education: education || [],
				certifications: certifications || [],
				projects: projects || [],
				achievements: achievements || [],
				interests: interests || [],
			},
		});

		res.status(201).json({
			success: true,
			message: "Candidate profile created successfully",
			data: candidateProfile,
		});
	} catch (error: any) {
		console.error("Error while creating candidate profile", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
};

const updateCandidateProfile = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		if (user.role !== USER_ROLE.candidate) {
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only candidates can update their profile!",
			});
			return;
		}

		const {
			name,
			email,
			phone,
			location,
			linkedin_url,
			github_url,
			portfolio_url,
			resume_url,
			skills,
			experience,
			education,
			certifications,
			projects,
			achievements,
			interests,
		} = req.body;

		const candidateProfile = await prisma.candidate_profile.upsert({
			where: {
				candidate_id: user.id,
			},
			update: {
				name,
				email,
				phone,
				location,
				linkedin_url,
				github_url,
				portfolio_url,
				resume_url,
				skills: skills || [],
				experience: experience || [],
				education: education || [],
				certifications: certifications || [],
				projects: projects || [],
				achievements: achievements || [],
				interests: interests || [],
			},
			create: {
				candidate_id: user.id,
				name,
				email,
				phone,
				location,
				linkedin_url,
				github_url,
				portfolio_url,
				resume_url,
				skills: skills || [],
				experience: experience || [],
				education: education || [],
				certifications: certifications || [],
				projects: projects || [],
				achievements: achievements || [],
				interests: interests || [],
			},
		});

		res.status(200).json({
			success: true,
			message: "Candidate profile updated successfully",
			data: candidateProfile,
		});
	} catch (error: any) {
		console.error("Error while updating candidate profile", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
};

const getRecruiterProfile = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		if (user.role !== USER_ROLE.recruiter) {
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only recruiters can access their profile!",
			});
			return;
		}

		const recruiterProfile = await prisma.recruiter_profile.findUnique({
			where: {
				recruiter_id: user.id,
			},
		});

		res.status(200).json({
			success: true,
			message: recruiterProfile ? "Recruiter profile fetched successfully" : "No profile found",
			data: recruiterProfile,
		});
	} catch (error: any) {
		console.error("Error while getting recruiter profile", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
};

const createRecruiterProfile = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		if (user.role !== USER_ROLE.recruiter) {
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only recruiters can create their profile!",
			});
			return;
		}

		// Check if profile already exists
		const existingProfile = await prisma.recruiter_profile.findUnique({
			where: {
				recruiter_id: user.id,
			},
		});

		if (existingProfile) {
			res.status(400).json({
				success: false,
				message: "Recruiter profile already exists!",
			});
			return;
		}

		const {
			company_name,
			company_logo,
			company_website,
			company_description,
			company_location,
			company_size,
			company_industry,
		} = req.body;

		const recruiterProfile = await prisma.recruiter_profile.create({
			data: {
				recruiter_id: user.id,
				company_name,
				company_logo,
				company_website,
				company_description,
				company_location,
				company_size: company_size ? parseInt(company_size) : null,
				company_industry,
			},
		});

		res.status(201).json({
			success: true,
			message: "Recruiter profile created successfully",
			data: recruiterProfile,
		});
	} catch (error: any) {
		console.error("Error while creating recruiter profile", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
};

const updateRecruiterProfile = async (req: Request, res: Response) => {
	try {
		const user = req.user;

		if (user.role !== USER_ROLE.recruiter) {
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only recruiters can update their profile!",
			});
			return;
		}

		const {
			company_name,
			company_logo,
			company_website,
			company_description,
			company_location,
			company_size,
			company_industry,
		} = req.body;

		const recruiterProfile = await prisma.recruiter_profile.upsert({
			where: {
				recruiter_id: user.id,
			},
			update: {
				company_name,
				company_logo,
				company_website,
				company_description,
				company_location,
				company_size: company_size ? parseInt(company_size) : null,
				company_industry,
			},
			create: {
				recruiter_id: user.id,
				company_name,
				company_logo,
				company_website,
				company_description,
				company_location,
				company_size: company_size ? parseInt(company_size) : null,
				company_industry,
			},
		});

		res.status(200).json({
			success: true,
			message: "Recruiter profile updated successfully",
			data: recruiterProfile,
		});
	} catch (error: any) {
		console.error("Error while updating recruiter profile", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
};

const getAllRecruiters = async (req: Request, res: Response) => {
	try {
		const user = req.user;
		if(user.role !== USER_ROLE.admin){
			res.status(401).json({
				success: false,
				message: "Unauthorized: Only admin can get all recruiters!",
			});
			return;
		}

		const recruiters = await prisma.user.findMany({
			where: {
				role: USER_ROLE.recruiter,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				recruiter_profile: {
					select: {
						company_name: true,
						company_logo: true,
						company_website: true,
						company_description: true,
						company_location: true,
						company_size: true,
						company_industry: true,
					},
				},
			},
		});

		if(recruiters.length === 0){
			res.status(401).json({
				success: false,
				message: "No recruiters found!",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Recruiters fetched successfully",
			data: recruiters,
		});
		return

	} catch (error: any) {
		console.error("Error while getting all recruiters", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error,
		});
	}
}

const usersController = {
	getUser,
	getAllUsers,
	getCandidate,
	getCandidateProfile,
	createCandidateProfile,
	updateCandidateProfile,
	getRecruiterProfile,
	createRecruiterProfile,
	updateRecruiterProfile,
	getAllRecruiters
};

export default usersController;
