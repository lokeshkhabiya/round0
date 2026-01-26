import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface InterviewTokenPayloadState {
	token: string;
	interview_token_payload: any;
}

interface InterviewTokenPayloadActions {
	setToken: (token: string) => void;
	setInterviewTokenPayload: (interview_token_payload: any) => void;
}

export const useInterviewTokenPayloadStore = create<InterviewTokenPayloadState & InterviewTokenPayloadActions>()(
	persist(
		(set) => ({
			token: "",
			interview_token_payload: null,
			setToken: (token: string) => set({ token }),
			setInterviewTokenPayload: (interview_token_payload: any) => set({ interview_token_payload }),
		}),
		{
			name: "interview-token-payload-store",
			storage: createJSONStorage(() => localStorage),
		}
	)
);