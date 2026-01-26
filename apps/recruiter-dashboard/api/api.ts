import { BASE_URL } from "@/lib/apiConnection";

export const jobPostingApi = {
    CREATE_JOB_POSTING: `${BASE_URL}job_posting/create_job`,
    GET_ALL_JOB_POSTING: `${BASE_URL}job_posting/get_jobs`,
    GET_JOB_POSTING_BY_ID: `${BASE_URL}job_posting/get_job_by_id`,
    UPDATE_JOB_POSTING_BY_ID: `${BASE_URL}job_posting/update_job_by_id`,
    DELETE_JOB_POSTING_BY_ID: `${BASE_URL}job_posting/delete_job_by_id`,
};

export const jobApplicationApi = {
    GET_APPLICATIONS_FOR_JOB: `${BASE_URL}job_applications/applied_candidates_for_job`,
    GET_APPLICATIONS_SHORTLISTED: `${BASE_URL}job_applications/applied_candidates_shortlisted`,
    UPDATE_APPLICATION_STATUS: `${BASE_URL}job_applications/status`,
    UPDATE_RECRUITER_DECISION: `${BASE_URL}job_applications/recruiter_decision`,
    SEND_INTERVIEW_INVITATION: `${BASE_URL}job_applications/invite_candidate`,
};

export const reportApi = {
    GET_REPORT: `${BASE_URL}report/getReportByInterviewRoundId`,
};

export const recruiterProfileApi = {
    GET_PROFILE: `${BASE_URL}users/recruiter-profile`,
    CREATE_PROFILE: `${BASE_URL}users/recruiter-profile`,
    UPDATE_PROFILE: `${BASE_URL}users/recruiter-profile`,
};