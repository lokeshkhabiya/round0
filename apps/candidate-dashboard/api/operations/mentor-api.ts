import { apiConnector } from "@/lib/apiConnector";
import { mentorApi } from "../api";

export interface MentorSession {
    id: string;
    candidate_id: string;
    interview_session_id?: string;
    title?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSessionResponse {
    success: boolean;
    message: string;
    data: MentorSession;
}

export interface MentorMessage {
    id: string;
    session_id: string;
    messenger_role: 'candidate' | 'ai_mentor';
    content: {
        text: string;
    };
    message_type: string;
    created_at: string;
    updated_at: string;
}

export interface GetSessionsResponse {
    success: boolean;
    message: string;
    data: MentorSession[];
}

export interface GetMessagesResponse {
    success: boolean;
    message: string;
    data: MentorMessage[];
}

export const createMentorSession = async (token: string): Promise<CreateSessionResponse> => {
    const response = await apiConnector(
        "POST",
        mentorApi.CREATE_SESSION,
        {},
        { Authorization: token },
        null,
        null
    );
    return response?.data;
};

export const sendMentorMessage = async (
    mentor_session_id: string,
    user_query: string,
    token: string
) => {
    const response = await fetch(mentorApi.SEND_MESSAGE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
        body: JSON.stringify({
            mentor_session_id,
            user_query,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
};

export const getMentorSessions = async (token: string): Promise<GetSessionsResponse> => {
    const response = await apiConnector(
        "GET",
        mentorApi.GET_SESSIONS,
        {},
        { Authorization: token },
        null,
        null
    );
    return response?.data;
};

export const getMentorSessionMessages = async (
    sessionId: string,
    token: string
): Promise<GetMessagesResponse> => {
    const response = await apiConnector(
        "GET",
        `${mentorApi.GET_MESSAGES}?mentor_session_id=${sessionId}`,
        {},
        { Authorization: token },
        null,
        null
    );
    return response?.data;
};