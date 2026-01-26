import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization;

	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	try {
		const userData = jwt.verify(token, process.env.JWT_SECRET as string);
		console.log(req.path);
		req.user = userData;
	} catch (error) {
		console.error("Error while verifying token", error);
		return res.status(401).json({ message: "Unauthorized" });
	}

	next();
}