"use client";

import type React from "react";

import { Chrome, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
    <div className="min-h-screen app-surface flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md page-fade-in">
        <Card className="overflow-hidden border-border/65 bg-card/78 backdrop-blur-sm">
          <CardContent className="p-7 md:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/85 shadow-sm">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.13em] text-muted-foreground">
                Candidate access
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLogin
                  ? "Continue your interview preparation."
                  : "Start practicing with realistic mock interviews."}
              </p>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="h-10 w-full"
                onClick={onGoogleAuth}
              >
                <Chrome className="mr-2 h-4 w-4" />
                {isLogin ? "Continue with Google" : "Sign up with Google"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-[0.11em]">
                  <span className="rounded-full bg-background px-2 text-muted-foreground">
                    or use email
                  </span>
                </div>
              </div>

              <form className="space-y-3.5" onSubmit={handleSubmit}>
                {isSignup ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs">
                      Full name
                    </Label>
                    <Input id="name" name="name" type="text" required />
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email
                  </Label>
                  <Input id="email" name="email" type="email" required />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs">
                      Password
                    </Label>
                    {isLogin ? (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={onForgotPassword}
                      >
                        Forgot password?
                      </button>
                    ) : null}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={isSignup ? 8 : undefined}
                  />
                </div>

                {isSignup ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs">
                      Confirm password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                    />
                  </div>
                ) : null}

                <Button type="submit" className="h-10 w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isSignup ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : isLogin ? (
                    "Sign in"
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <p className="pt-1 text-center text-sm text-muted-foreground">
                {isLogin ? "New to Round0?" : "Already have an account?"}{" "}
                <button
                  className="font-medium text-foreground hover:underline"
                  onClick={() => onModeChange?.(isLogin ? "signup" : "login")}
                >
                  {isLogin ? "Create one" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
