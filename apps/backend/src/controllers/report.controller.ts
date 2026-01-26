import { USER_ROLE } from "@prisma/client";
import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import s3Service from "../services/s3-service";
import { getRecordingUrl } from "../lib/recording-url";

const getReport = async (req: Request, res: Response) => {
	try {
		const { round_id } = req.query;
		const { role, id: recuiter_id } = req.user; 

		if ( role === USER_ROLE.candidate ) {
			res.status(400).json({ message: "You are not authorized to access this resource" });
			return;
		}

		if (!round_id || typeof round_id !== 'string') {
			res.status(400).json({ message: "Invalid round_id parameter" });
			return;
		}

		const round = await prisma.interview_round.findUnique({
			where: {
				id: round_id as string,
			},
			select: {
				session: {
					select: {
						session_recording: {
							select: {
								urls: true
							}
						},
						application: {
							select: {
								job_description: {
									select: {
										recruiter_id: true	
									}
								}
							}
						}
					}
				}, 
			}
		})

		if ( !round ) {
			res.status(404).json({ message: "Round not found" });
			return;
		}

		if (role !== USER_ROLE.admin) {
			if (round.session.application.job_description.recruiter_id !== recuiter_id) {
				res.status(403).json({ message: "You are not authorized to access this resource" });
				return;
			}
		}
		
		const detailedReport = await prisma.interview_round.findUnique({
			where: {
				id: round_id as string,
				
			},
			select: {
				zero_score: true,
				score_components: true,
				ai_summary: true,
				report_data: true,
				report_generated_at: true,
				recruiter_decision: true,
				decision_at: true,
				session_id: true
			}
		})
		
		let signedUrls = null;
		const sessionRecording = await prisma.session_recording.findUnique({
			where: {
				session_id_round_id: {
					session_id: detailedReport?.session_id as string,
					round_id: round_id as string
				}
			},
			select: {
				urls: true
			}
		})	
		if (sessionRecording && sessionRecording.urls && sessionRecording.urls.length > 0) {
			const videoUrl = sessionRecording.urls[0]; 
			let audioUrl = sessionRecording.urls.length > 1 ? sessionRecording.urls[1] : null; 

			if (!audioUrl) {
				audioUrl = await getRecordingUrl(round_id as string);
			}
			
			const extractKeyFromS3Url = (url: string): string => {
				try {
					const urlObj = new URL(url);	
					return urlObj.pathname.substring(1);
				} catch (error) {
					return url;
				}
			};
			
			signedUrls = {
				video: await s3Service.getFileUrl(process.env.AWS_BUCKET_NAME || '', extractKeyFromS3Url(videoUrl as string)),
				audio: audioUrl ? await s3Service.getFileUrl(process.env.AWS_BUCKET_NAME || '', extractKeyFromS3Url(audioUrl)) : null
			}
		}

		res.status(200).json({
			success: true,
			message: "Report fetched successfully for round",
			report: detailedReport,
			videoAndAudioData: signedUrls
		});
		return;	

	} catch (error) {
		console.error("Error while getting report", error);
		res.status(500).json({ message: "Internal server error" });
		return;
	}
}

const reportController = {
	getReport
}

export default reportController;	