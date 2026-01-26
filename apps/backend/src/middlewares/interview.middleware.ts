import type { NextFunction, Request, Response } from "express";
import { verifyInterviewToken } from "../lib/interview-token";


declare global {
	namespace Express {
		interface Request {
			interview_token: any;
		}
	}
}

export const authenticateInterview = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { interview_token } = req.query;

		if (!interview_token) {
			return res.status(400).json({ message: "Interview token is required" });
		}

		const decoded = verifyInterviewToken(interview_token as string);

		if (!decoded) {
			return res.status(400).json({ message: "Invalid interview token" });
		}

		req.interview_token = decoded;

		next();
		
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Internal server error" });
	}
}	