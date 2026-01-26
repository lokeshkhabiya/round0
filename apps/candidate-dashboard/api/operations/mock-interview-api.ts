import { mockInterviewApi } from "../api"
import { apiConnector } from "@/lib/apiConnector"

export const getMockInterviews = async (token: string) => {
    const response = await apiConnector(
        "GET",
        mockInterviewApi.GET_MOCK_INTERVIEWS,
        null,
        { Authorization: token },
        null,
        null
    )
    return response?.data;
}

export const getMockInterviewDetailsAndAttempts = async (token: string, mock_job_id: string) => {
    const response = await apiConnector(
        "GET",
        mockInterviewApi.GET_MOCK_INTERVIEW_DETAILS_AND_ATTEMPTS,
        null,
        { Authorization: token },
        { mock_job_id },
        null
    )
    return response?.data;
}

export const startMockInterview = async (token: string, mock_job_id: string) => {
    const response = await apiConnector(
        "POST",
        mockInterviewApi.START_MOCK_INTERVIEW,
        { mock_job_id },
        { Authorization: token },
        null,
        null
    )

    return response?.data;
}

export const getReport = async (token: string, round_id: string) => {
    const response = await apiConnector(
        "GET",
        mockInterviewApi.GET_REPORT,
        null,
        { Authorization: token },
        { round_id },
        null
    )

    return response?.data;
}