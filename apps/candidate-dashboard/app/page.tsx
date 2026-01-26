"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function Home() {
	const router = useRouter();
	const { isAuthenticated } = useAuthStore();

	useEffect(() => {
		if (isAuthenticated) {
			router.push("/dashboard");
		} else {
			router.push("/auth/login");
		}
	}, [isAuthenticated, router]);

	return (
		<div className="flex justify-center items-center h-screen bg-background">
			<div className="flex gap-1">
				<div
					className="w-3 h-3 rounded-full bg-primary animate-bounce"
					style={{ animationDelay: "0ms" }}
				></div>
				<div
					className="w-3 h-3 rounded-full bg-primary animate-bounce"
					style={{ animationDelay: "150ms" }}
				></div>
				<div
					className="w-3 h-3 rounded-full bg-primary animate-bounce"
					style={{ animationDelay: "300ms" }}
				></div>
			</div>
		</div>
	);
}
