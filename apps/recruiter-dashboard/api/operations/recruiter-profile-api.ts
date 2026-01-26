import { apiConnector } from "@/lib/apiConnector";
import { recruiterProfileApi } from "../api";

export interface RecruiterProfileData {
    company_name: string;
    company_logo?: string;
    company_website?: string;
    company_description?: string;
    company_location?: string;
    company_size?: number;
    company_industry?: string;
}

export const getRecruiterProfile = async (token: string) => {
    const response = await apiConnector(
        "GET",
        recruiterProfileApi.GET_PROFILE,
        null,
        { Authorization: token },
        null,
        null
    );
    return response?.data;
};

export const createRecruiterProfile = async (profileData: RecruiterProfileData, token: string) => {
    const response = await apiConnector(
        "POST",
        recruiterProfileApi.CREATE_PROFILE,
        profileData,
        { Authorization: token },
        null,
        null
    );
    return response?.data;
};

export const updateRecruiterProfile = async (profileData: RecruiterProfileData, token: string) => {
    const response = await apiConnector(
        "PUT",
        recruiterProfileApi.UPDATE_PROFILE,
        profileData,
        { Authorization: token },
        null,
        null
    );
    return response?.data;
}; 