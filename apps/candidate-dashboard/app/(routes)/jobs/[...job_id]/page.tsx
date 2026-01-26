"use client";

import { applyForJob } from "@/api/operations/job-application-api";
import { getJobById } from "@/api/operations/job-fetching-api";
import { JobDetail, JobDetailComponent } from "@/components/job-details";
import { useAuthStore } from "@/stores/auth-store";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function JobDetailPage() {
	const [jobDetailData, setJobDetailData] = useState<JobDetail>();
	const [applied, setApplied] = useState(false);
	const params = useParams();
	const { token } = useAuthStore();

	const job_id = params.job_id?.[0];

	const fetchJobDetails = async () => {
		const response = await getJobById(job_id as string, token as string);

		if (!response?.success) {
			toast.error(response?.message);
			return;
		}

		setJobDetailData(response?.data);
	};
	useEffect(() => {
		if (job_id && token) {
			fetchJobDetails();
		}
	}, [job_id,token]);

	const handleApply = async (jobId: string) => {
		const response = await applyForJob(jobId, token as string);
		if (!response?.success) {
			toast.error(response?.message);
			return;
		}

		if (response?.success) {
			setApplied(true);
			toast.success(response?.message);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<JobDetailComponent
				job={jobDetailData!}
				onApply={handleApply}
				applied={applied}
			/>
		</div>
	);
}
