"use client";
import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = async (
    method: string,
    url: string,
    data: object | null,
    headers: object | null,
    params: object | null,
    responseType:
        | "arraybuffer"
        | "blob"
        | "json"
        | "text"
        | "stream"
        | null
) => {
    try {
        const fields = {
            method: method,
            url: url,
            data: data || undefined,
            headers: headers || undefined,
            params: params || undefined,
            responseType: responseType || undefined,
        };
		
        const response = await axiosInstance(fields);

        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return {
                data: {
                    success: false,
                    message: error.response?.data.message || 'An error occurred',
                }
            };
        }
        return {
            data: {
                success: false,
                message: 'An unexpected error occurred',
            }
        };
    }
}