import { apiConnector } from "@/lib/apiConnector";
import { interviewApi } from "../api";

export const verifyInterview = async (interview_token: string) => {
	const response = await apiConnector(
		"GET",
		interviewApi.VERIFY_INTERVIEW,
		{},
		{},
		{ interview_token },
		null
	)

	return response?.data;
}

export const evaluateCanvas = async (interviewId: string, question: string, canvasImage: string, token: string,canvasData: any) => {
	const response = await apiConnector(
		"POST",
		interviewApi.EVALUATE_CANVAS + `?interview_token=${token}`,
		{ interviewId, question, canvasImage, canvasData },
		{},
		{},
		null
	)

	return response?.data;
}

export const getAgentUrl = async (roundId: string, token: string) => {
	const response = await apiConnector(
		"POST",
		interviewApi.AGENT_URL + `?interview_token=${token}`,
		{ round_id: roundId },
		{},
		{},
		null
	)

	return response?.data;
}


export const endInterviewRound = async (roundId: string, token: string) => {
	const response = await apiConnector(
		"POST",
		interviewApi.END_INTERVIEW + `?interview_token=${token}`,
		{ round_id: roundId },
		{},
		{},
		null
	)

	return response?.data;
}

export const uploadRecording = async (roundId: string, token: string, recording: Blob) => {
	const formData = new FormData();
	formData.append("recording", recording, "recording.webm");

	const response = await apiConnector(
		"POST",
		`${interviewApi.UPLOAD_RECORDING}/${roundId}/upload-recording?interview_token=${token}`,
		formData,
		{ "Content-Type": "multipart/form-data" },
		{},
		null
	);

	return response?.data;
}

export const uploadAudioRecording = async (roundId: string, token: string) => {
	const response = await apiConnector(
		"POST",
		interviewApi.UPLOAD_AUDIO_RECORDING,
		{},
		{},
		{ round_id: roundId, interview_token: token },
		null
	)

	return response?.data;
}

export const saveMessageToDatabase = async (
	roundId: string,
	token: string,
	messageData: {
		messenger_role: 'ai_interviewer' | 'candidate' | 'system';
		content: any;
		message_type: 'text' | 'audio' | 'tool_call' | 'tool_result' | 'system' | 'feedback';
		audio_url?: string;
		conversation_id?: string;
	}
) => {

	const response = await apiConnector(
		"POST",
		interviewApi.SAVE_MESSAGE + `?interview_token=${token}`,
		messageData,
		{},
		{},
		null
	);
	return response?.data;
};

export const saveToolResultToDatabase = async (
	token: string,
	toolData: {
		tool_name: string;
		input_data: any;
		output_data: any;
		passed?: boolean;
		metadata?: any;
	}
) => {
	const response = await apiConnector(
		"POST",
		interviewApi.SAVE_TOOL_RESULT + `?interview_token=${token}`,
		toolData,
		{},
		{},
		null
	);
	return response?.data;
};
