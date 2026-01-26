import { CODE_EXECUTOR_URL } from "@/lib/apiConnection";
import { apiConnector } from "@/lib/apiConnector"
import { LANGUAGE_VERSIONS } from "@/utils/constants";
import { interviewApi } from "../api";

export const runCode = async (language : string, code: string) => {
    const response = await apiConnector(
        "POST",
        `${CODE_EXECUTOR_URL}/execute`,
        {   
            "language": language,
            "version": LANGUAGE_VERSIONS[language as keyof typeof LANGUAGE_VERSIONS],
            "files": [
              {
                "content": code
              }
            ] },
        {},
        {},
        "json"
    );
    return response?.data;
}


export const evaluateCode = async (language : string, code: string,question : string,token : string) => {
    const response = await apiConnector(
        "POST",
        interviewApi.EVALUATE_CODE + `?interview_token=${token}`,
        { code, language, question },
        {},
        {},
        "json"
    );
    return response?.data;
}