"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Chrome, Loader2 } from "lucide-react";

interface AuthComponentProps {
	mode: "login" | "signup";
	onModeChange?: (mode: "login" | "signup") => void;
	onGoogleAuth?: () => void;
	onSubmit?: (data: { email: string; password: string; name?: string }) => void;
	onForgotPassword?: () => void;
	isLoading?: boolean;
}

export default function Auth({
	mode = "login",
	onModeChange,
	onGoogleAuth,
	onSubmit,
	onForgotPassword,
	isLoading = false,
}: AuthComponentProps) {
	const isLogin = mode === "login";
	const isSignup = mode === "signup";

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
			...(isSignup && { name: formData.get("name") as string }),
		};
		onSubmit?.(data);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold">
						{isLogin ? "Welcome back" : "Create account"}
					</CardTitle>
					<CardDescription>
						{isLogin
							? "Sign in to your account to continue"
							: "Sign up to get started with your account"}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button
						variant="outline"
						className="w-full h-11 font-medium"
						onClick={onGoogleAuth}
					>
						<Chrome className="mr-2 h-4 w-4" />
						{isLogin ? "Continue with Google" : "Sign up with Google"}
					</Button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<Separator className="w-full" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or {isLogin ? "continue" : "sign up"} with
							</span>
						</div>
					</div>

					<form className="space-y-4" onSubmit={handleSubmit}>
						{isSignup && (
							<div className="space-y-2">
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder="John Doe"
									className="h-11"
									required
								/>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="name@example.com"
								className="h-11"
								required
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								{isLogin && (
									<Button
										type="button"
										variant="link"
										className="px-0 font-normal text-sm h-auto"
										onClick={onForgotPassword}
									>
										Forgot password?
									</Button>
								)}
							</div>
							<Input
								id="password"
								name="password"
								type="password"
								className="h-11"
								required
								minLength={isSignup ? 8 : undefined}
							/>
						</div>

						{isSignup && (
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									className="h-11"
									required
								/>
							</div>
						)}

						<Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
							{isLoading && isSignup ? (
								<div className="flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									<span>Creating Account...</span>
								</div>
							) : (
								isLogin ? "Sign In" : "Create Account"
							)}
						</Button>
					</form>

					{isSignup && (
						<p className="text-xs text-center text-muted-foreground">
							By creating an account, you agree to our{" "}
							<Button
								variant="link"
								className="px-0 font-normal text-xs h-auto"
							>
								Terms of Service
							</Button>{" "}
							and{" "}
							<Button
								variant="link"
								className="px-0 font-normal text-xs h-auto"
							>
								Privacy Policy
							</Button>
						</p>
					)}
				</CardContent>

				<CardFooter className="flex flex-col space-y-4">
					<div className="text-center text-sm text-muted-foreground">
						{isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
						<Button
							variant="link"
							className="px-0 font-normal h-auto"
							onClick={() => onModeChange?.(isLogin ? "signup" : "login")}
						>
							{isLogin ? "Sign up" : "Sign in"}
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
