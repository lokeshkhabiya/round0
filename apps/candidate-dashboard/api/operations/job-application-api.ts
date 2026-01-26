import { apiConnector } from "@/lib/apiConnector";
import { jobApplicationApi } from "../api";

export const applyForJob = async (job_id: string, token: string) => {
    const response = await apiConnector(
        "POST",
        jobApplicationApi.APPLY_FOR_JOB,
        { job_id },
        { Authorization: token },
        null,
        null
    );
    return response?.data;
}

export const getAllApplications = async (token: string) => {
    const response = await apiConnector(
        "GET",
        jobApplicationApi.GET_ALL_APPLICATIONS,
        {},
        { Authorization: token },
        null,
        null
    );
    return response?.data;
}