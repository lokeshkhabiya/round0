import { apiConnector } from "@/lib/apiConnector";
import { jobFetchingApi } from "../api";

export const getAllJobs = async (token: string) => {
	const response = await apiConnector(
		"GET",
		jobFetchingApi.GET_ALL_JOBS,
		null,
        { Authorization: token },
		null,
		null
	);
	return response?.data;
};

export const getJobById = async (job_id: string, token: string) => {
	const response = await apiConnector(
		"GET",
		jobFetchingApi.GET_JOB_BY_ID + `?job_id=${job_id}`,
		null,
        { Authorization: token },
		null,
		null
	);
	return response?.data;
};
