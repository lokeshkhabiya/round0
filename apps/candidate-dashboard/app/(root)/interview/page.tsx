"use client";
import { verifyInterview } from "@/api/operations/interview-api";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import { useInterviewTokenPayloadStore } from "@/stores/interview-token-payload-store";
import { toast } from "sonner";

const InterviewVerification = () => {
	const searchParams = useSearchParams();
	const interview_token = searchParams.get("token");
	const { setToken, setInterviewTokenPayload } =
		useInterviewTokenPayloadStore();

	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setLoading(true);
		try {
			const verifyInterviewDetails = async () => {
				const response = await verifyInterview(interview_token as string);

				if (response?.success) {
					setToken(interview_token as string);
					setInterviewTokenPayload(response?.data);
					toast.success(response?.message);
					router.push(`/interview/${response?.round_id}`);
				} else {
					toast.error(response?.message);
				}
			};

			verifyInterviewDetails();
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	}, [interview_token]);

	return (
		<>
			{loading && (
				<div className="flex justify-center items-center h-screen">
					<Loader2 className="animate-spin" />
				</div>
			)}
		</>
	);
};

const InterviewPage = () => {
	return (
		<Suspense
			fallback={
				<div className="flex justify-center items-center h-screen">
					<Loader2 className="animate-spin" />
				</div>
			}
		>
			<InterviewVerification />
		</Suspense>
	);
};

export default InterviewPage;
