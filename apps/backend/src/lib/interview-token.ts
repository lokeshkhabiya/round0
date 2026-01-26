import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET! as string;

export interface InterviewTokenPayload {
    candidate_id: string;
    recruiter_id: string;
    job_description_id: string;
    application_id: string;
    interview_session_id: string;
    interview_round_id: string;
    round_type: string;
    round_number: number;
    type: 'interview_invitation';
    title: string;
    candidate_name: string;
    recruiter_name: string;
    description: string;
    jd_skills: string;
    jd_experience: string;
}

export const createInterviewToken = (payload: InterviewTokenPayload, expiresIn: string = '24h'): string => {
	// @ts-expect-error - JWT_SECRET is a string
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyInterviewToken = (token: string): InterviewTokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as InterviewTokenPayload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
};