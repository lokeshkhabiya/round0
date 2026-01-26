import { apiConnector } from "@/lib/apiConnector";
import { jobApplicationApi } from "../api";

export const getApplicationsForJob = async (job_id: string, token: string) => {
    try {
        const response = await apiConnector(
            "GET",
            jobApplicationApi.GET_APPLICATIONS_FOR_JOB,
            null,
            { Authorization: token },
            { job_id },
            null
        );
        return response?.data;
    } catch (error) {
        console.error("Error fetching applicants:", error);
        return null;
    }
};

export const getApplicationsShortlisted = async (job_id: string, round_number: number, round_type: string, token: string) => {
    try {
        const response = await apiConnector(
            "GET",
            jobApplicationApi.GET_APPLICATIONS_SHORTLISTED,
            null,
            { Authorization: token },
            { job_id, round_number, round_type },
            null
        );
        return response?.data;
    } catch (error) {
        console.error("Error fetching shortlisted candidates:", error);
        return null;
    }
};

export const updateApplicationStatus = async (application_id: string, status: string, token: string) => {
    try {
        const response = await apiConnector(
            "POST",
            jobApplicationApi.UPDATE_APPLICATION_STATUS,
            { application_id, status },
            { Authorization: token },
            null,
            null
        );
        return response?.data;
    } catch (error) {
        console.error("Error updating application status:", error);
        return null;
    }
};

export const updateRecruiterDecision = async (interview_round_id: string, decision: string, token: string) => {
    try {
        const response = await apiConnector(
            "POST",
            jobApplicationApi.UPDATE_RECRUITER_DECISION,
            { interview_round_id, decision },
            { Authorization: token },
            null,
            null
        );
        return response?.data;
    } catch (error) {
        console.error("Error updating recruiter decision:", error);
        return null;
    }
};

export const sendInterviewInvitation = async (job_id: string, round_number: string, round_type: string, token: string) => {
    try {
        const response = await apiConnector(
            "POST",
            jobApplicationApi.SEND_INTERVIEW_INVITATION,
            { job_id, round_number, round_type},
            { Authorization: token },
            null,
            null
        );  

        return response?.data;
    } catch (error) {
        console.error("Error sending interview invitation:", error);
        return null;
    }
};