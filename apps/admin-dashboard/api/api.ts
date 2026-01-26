import { BASE_URL } from "@/lib/apiConnection";

export const jobFetchingApi = {
    GET_ALL_JOBS: `${BASE_URL}job_posting/get_jobs`,
    GET_JOB_BY_ID: `${BASE_URL}job_posting/get_job_by_id`,
}

export const candidateApi = {
    GET_ALL_CANDIDATES : `${BASE_URL}users/get_all_candidates`,
    GET_CANDIDATE_DATA : `${BASE_URL}users/get_candidate`
}

export const reportApi = {
    GET_REPORT: `${BASE_URL}report/getReportByInterviewRoundId`,
};

export const recruiterApi = {
    GET_ALL_RECRUITERS : `${BASE_URL}users/get_all_recruiters`,
}