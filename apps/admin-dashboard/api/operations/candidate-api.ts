
import { apiConnector } from "@/lib/apiConnector";
import { candidateApi } from "../api";


export const getAllCandidates = async (token: string) => {
	const response = await apiConnector(
		"GET",
        candidateApi.GET_ALL_CANDIDATES,
		null,
        { Authorization: token },
		null,
		null
	);
	return response?.data;
};


export const getCandidateData = async (token : string, candidate_id : string) => {
	const response = await apiConnector(
		"GET",
        candidateApi.GET_CANDIDATE_DATA + `?candidate_id=${candidate_id}`,
		null,
        { Authorization: token },
		null,
		null
	);
	return response?.data;
}