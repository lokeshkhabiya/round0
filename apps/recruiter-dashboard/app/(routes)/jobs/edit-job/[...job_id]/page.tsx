"use client";
import { JobDetail } from "@/components/edit-job-in-detail";
import { useEffect, useState } from "react";
import EditJobInDetailComponent from "@/components/edit-job-in-detail";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getJobDetailPostedByRecruiter } from "@/api/operations/job-posting-api";
import { Loader2 } from "lucide-react";

export default function EditJobPage() {

	const [loading, setLoading] = useState(false);
	const [jobDetailData, setJobDetailData] = useState<JobDetail | null>(null);
	const { token } = useAuthStore(); 
	const params = useParams(); 

	const job_id = params.job_id?.[0] || "";

	useEffect(() => {
		try {
			setLoading(true);
			const getJobDetail = async () => {
				const response = await getJobDetailPostedByRecruiter(job_id, token);
				if (response?.success) {
					setJobDetailData(response?.data);
				}
			}
			getJobDetail();
		} catch (error) {
			console.error("Error fetching job details:", error);
		} finally {
			setLoading(false);
		}
	}, [job_id, token]);

	return (
		<>
		{ loading ? (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		) : (
			<div className="min-h-screen bg-background">
				<EditJobInDetailComponent job={jobDetailData!}/>
			</div>
		)}
		</>
	)
}