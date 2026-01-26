"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { createJwt } from "@/utils/jwt";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

function AuthCallback() {
	const { setToken, userData } = useAuthStore();
	const router = useRouter();
	const searchParams = useSearchParams();
	useEffect(() => {
		const role = searchParams.get("role");
		const setRoleAndRedirect = async () => {
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();
			if (sessionError) {
				console.error("Error getting session:", sessionError);
				router.push("/auth/login");
			}
			if (session) {
				const { data, error } = await supabase.auth.getUser();

				if (error) {
					console.error("Error getting user data:", error);
					router.replace("/auth/login");
					return;
				}

				if (data) {
					const user = {
						id: data.user?.id,
						email: data.user?.email,
						name: data.user?.user_metadata.name,
						role: role,
						created_at: data.user?.created_at,
						updated_at: data.user?.updated_at,
					};

					// First check if user exists
					const { data: existingUser, error: checkError } = await supabase
						.from("user")
						.select()
						.eq("email", user.email)
						.single();

					let insertData;
					let error;

					if (!existingUser) {
						// Only insert if user doesn't exist
						const result = await supabase.from("user").insert([user]).select();
						insertData = result.data?.[0];
						error = result.error;
					} else {
						if(existingUser.role !== role){
							toast.error(`You are not authorised for ${role} Dashboard`)
							router.replace("/auth/login");
							return;
						}
						insertData = existingUser;
						error = checkError;
					}

					if (error) {
						console.log("Error creating user", error);
						router.replace("/auth/login");
						return;
					}

					if (insertData) {
						const payload = {
							id : insertData.id,
							email : insertData.email,
							name : insertData.name,
							role : insertData.role,
						}

						const token = await createJwt(payload);
						// localStorage.setItem("token",token);
						setToken(token);
						userData(insertData);
						router.replace("/dashboard");
					}
				}
			}
		};
		setRoleAndRedirect();
	}, [router, searchParams]);
	return null;
}

export default function AuthCallbackPage() {
	return (
		<Suspense fallback={<CallbackLoader />}>
			<AuthCallback />
		</Suspense>
	);
}

const CallbackLoader = () => (
	<div className="flex justify-center items-center h-screen">
		<div className="flex gap-1">
			<div
				className="w-3 h-3 rounded-full bg-white animate-bounce text-black"
				style={{ animationDelay: "0ms" }}
			></div>
			<div
				className="w-3 h-3 rounded-full bg-white animate-bounce text-black"
				style={{ animationDelay: "150ms" }}
			></div>
			<div
				className="w-3 h-3 rounded-full bg-white animate-bounce text-black"
				style={{ animationDelay: "300ms" }}
			></div>
		</div>
	</div>
);
