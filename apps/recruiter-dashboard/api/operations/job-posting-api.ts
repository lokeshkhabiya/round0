import { apiConnector } from "@/lib/apiConnector";
import { jobPostingApi } from "../api";

export const createJobPosting = async (
    title: string,
    description: string,
    jd_payload: object,
    token: string
) => {
    try {
        const response = await apiConnector(
            "POST",
            jobPostingApi.CREATE_JOB_POSTING,
            { title, description, jd_payload },
            { Authorization: token },
            null,
            null
        );
        return response?.data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getJobsPostedByRecruiter = async (token: string) => {
    try {
        const response = await apiConnector(
            "GET",
            jobPostingApi.GET_ALL_JOB_POSTING,
            null, 
            { Authorization: token },
            null,
            null
        );
        return response?.data;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

export const getJobDetailPostedByRecruiter = async (job_id: string, token: string) => {
    try {
        const response = await apiConnector(
            "GET",
            jobPostingApi.GET_JOB_POSTING_BY_ID,
            null,
            { Authorization: token },
            { job_id },
            null
        );
        return response?.data;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

export const updateJobPosting = async (job_id: string, title: string, description: string, jd_payload: object, token: string) => {
    try {
        const response = await apiConnector(
            "POST",
            jobPostingApi.UPDATE_JOB_POSTING_BY_ID,
            { job_id, title, description, jd_payload },
            { Authorization: token },
            null,
            null
        );
        return response?.data;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}