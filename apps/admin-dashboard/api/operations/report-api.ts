import { apiConnector } from "@/lib/apiConnector";
import { reportApi } from "../api";

export const getReport = async (round_id: string, token: string) => {
	try {
		const response = await apiConnector(
			"GET",
			reportApi.GET_REPORT,
			null,
			{ Authorization: token },
			{ round_id },
			null
		);
		return response?.data;
	} catch (error) {
		console.error("Error while fetching reports: ", error);
		return null; 
	}
}; 