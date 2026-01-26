"use client";
import Auth from "@/components/Auth";
import React, { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { toast } from "sonner";

const LoginPage = () => {
	const [authMode, setAuthMode] = useState<"login" | "signup">("login");
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleAuth = async () => {
		console.log(`Google ${authMode} initiated`);
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${location.origin}/auth/callback?role=recruiter`,
			},
		});
	};

	const handleSubmit = async (data: {
		email: string;
		password: string;
		name?: string;
	}) => {
		console.log(`${authMode} submitted:`, data);
		setIsLoading(true);
		
		try {
			if (authMode === "signup") {
				const { error } = await supabase.auth.signUp({
					email: data.email,
					password: data.password,
					options: {
						data: {
							role: "recruiter",
							name : data.name
						},
						emailRedirectTo: `${location.origin}/auth/callback?role=recruiter`,
					},
				});
				if (error) {
					console.log("Signup error:", error.message);
				} else {
					// Handle successful signup, maybe show a message to check email
					toast.success("Confirmation Mail Send Successfully!");
				}
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email: data.email,
					password: data.password,
				});
				if (error) {
					console.log("Login error:", error.message);
					toast.error(error.message);
				} else {
					redirect("/");
				}
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleForgotPassword = () => {
		console.log("Forgot password clicked");
		// Implement forgot password logic here
	};
	return (
		<div>
			<Auth
				mode={authMode}
				onModeChange={setAuthMode}
				onGoogleAuth={handleGoogleAuth}
				onSubmit={handleSubmit}
				onForgotPassword={handleForgotPassword}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default LoginPage;
