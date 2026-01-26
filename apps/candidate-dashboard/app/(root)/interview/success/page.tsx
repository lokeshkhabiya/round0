"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function InterviewSuccessPage() {
	const router = useRouter();

	const handleOkClick = () => {
		router.push("/jobs");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="max-w-md w-full mx-auto text-center space-y-6 p-8">
				<div className="flex justify-center">
					<CheckCircle className="h-16 w-16 text-green-500" />
				</div>
				
				<div className="space-y-2">
					<h1 className="text-2xl font-bold text-foreground">
						Interview Completed Successfully!
					</h1>
					<p className="text-muted-foreground">
						Thank you for completing your interview. Your recording has been uploaded successfully.
					</p>
				</div>

				<Button 
					onClick={handleOkClick}
					className="w-full"
					size="lg"
				>
					OK
				</Button>
			</div>
		</div>
	);
} 