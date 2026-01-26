import { apiConnector } from "@/lib/apiConnector";
import { candidateProfileApi } from "../api";

export interface CandidateProfileData {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    skills: string[];
    experience: string[];
    education: string[];
    certifications: string[];
    projects: string[];
    achievements: string[];
    interests: string[];
}

export const getCandidateProfile = async (token: string) => {
    const response = await apiConnector(
        "GET",
        candidateProfileApi.GET_PROFILE,
        null,
        { Authorization: token },
        null,
        null
    );
    return response?.data;
};

export const createCandidateProfile = async (profileData: CandidateProfileData, token: string) => {
    const response = await apiConnector(
        "POST",
        candidateProfileApi.CREATE_PROFILE,
        profileData,
        { Authorization: token },
        null,
        null
    );
    return response?.data;
};

export const updateCandidateProfile = async (profileData: CandidateProfileData, token: string) => {
    const response = await apiConnector(
        "PUT",
        candidateProfileApi.UPDATE_PROFILE,
        profileData,
        { Authorization: token },
        null,
        null
    );
    return response?.data;
};