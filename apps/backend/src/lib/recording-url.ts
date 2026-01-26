import s3Service from "../services/s3-service";
import prisma from "./prisma";

export const getRecordingUrl = async (round_id: string) => {
	try {

		const roundDetail = await prisma.interview_round.findUnique({
			where: {
				id: round_id as string
			},
			select: {
				session_id: true
			}
		});

		const sessionRecordings = await prisma.session_recording.findUnique({
			where: {
				session_id_round_id: {
					session_id: roundDetail?.session_id as string,
					round_id: round_id as string
				}
			}
		})

		if (!sessionRecordings) {
			return null;
		}

		const conversation_id = await prisma.message.findFirst({
			where: {
				round_id: round_id as string,
			},
			select: {
				conversation_id: true
			}
		});

		if (!conversation_id?.conversation_id) {
			return null;
		}

		const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversation_id.conversation_id}/audio`;
		const options = {method: 'GET', headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY || ''}};

		try {
			const response: any = await fetch(url, options);
			const data = await response.blob();
			
			// Convert blob to buffer for S3 upload
			const buffer = Buffer.from(await data.arrayBuffer());

			const audioUrl = await s3Service.uploadAudioFile(
				process.env.AWS_BUCKET_NAME || '',
				`recordings/recording-audio/${round_id}-${Date.now()}.mp3`,
				buffer,
				'audio/mpeg'
			);

			const updatedSessionRecordings = await prisma.session_recording.update({
				where: {
					id: sessionRecordings.id
				},
				data: {
					urls: [...sessionRecordings.urls, audioUrl]
				}
			})

			return audioUrl;
			
		} catch (error) {
			console.error("Error parsing JSON or making request:", error);
			return null;
		}

	} catch (error) {
		console.error("Error getting recording URL:", error);
		return null;
	}
}