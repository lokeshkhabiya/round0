import { BASE_URL } from "@/lib/apiConnection";

export const jobFetchingApi = {
    GET_ALL_JOBS: `${BASE_URL}job_posting/get_jobs`,
    GET_JOB_BY_ID: `${BASE_URL}job_posting/get_job_by_id`,
}

export const jobApplicationApi = {
    APPLY_FOR_JOB: `${BASE_URL}job_applications`,
    GET_ALL_APPLICATIONS: `${BASE_URL}job_applications/all_applications_by_candidate`,
}

export const interviewApi = {
    VERIFY_INTERVIEW: `${BASE_URL}interview/verify`,
    EVALUATE_CANVAS: `${BASE_URL}interview/evaluate-design`,
    EVALUATE_CODE: `${BASE_URL}interview/evaluate-code`,
    AGENT_URL: `${BASE_URL}interview/agent-url`,
    END_INTERVIEW: `${BASE_URL}interview/end`,
    UPLOAD_RECORDING: `${BASE_URL}interview/round`,
    UPLOAD_AUDIO_RECORDING: `${BASE_URL}interview/round/audio-recording`,
    SAVE_MESSAGE: `${BASE_URL}interview/message`,
    SAVE_TOOL_RESULT: `${BASE_URL}interview/tool-result`,
}

export const candidateProfileApi = {
    GET_PROFILE: `${BASE_URL}users/profile`,
    CREATE_PROFILE: `${BASE_URL}users/profile`,
    UPDATE_PROFILE: `${BASE_URL}users/profile`,
}

export const mockInterviewApi = {
    GET_MOCK_INTERVIEWS: `${BASE_URL}mockinterview/get_mockinterviews`,
    GET_MOCK_INTERVIEW_DETAILS_AND_ATTEMPTS: `${BASE_URL}mockinterview/get_mockinterview_details_and_attempts`,
    START_MOCK_INTERVIEW: `${BASE_URL}mockinterview/start_mockinterview`,
    GET_REPORT: `${BASE_URL}mockinterview/get_report`,
}

export const mentorApi = {
    CREATE_SESSION: `${BASE_URL}mentor/create-session`,
    SEND_MESSAGE: `${BASE_URL}mentor/message`,
    GET_SESSIONS: `${BASE_URL}mentor/get-sessions`,
    GET_MESSAGES: `${BASE_URL}mentor/get-messages`,
}