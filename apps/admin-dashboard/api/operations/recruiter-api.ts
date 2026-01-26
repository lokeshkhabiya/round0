import { recruiterApi } from "../api";
import { apiConnector } from "@/lib/apiConnector";

export const getAllRecruiters = async (token: string) => {
  const response = await apiConnector(
    "GET",
    recruiterApi.GET_ALL_RECRUITERS,
    null,
    { Authorization: token },
    null,
    null
  );
  return response?.data;
};
