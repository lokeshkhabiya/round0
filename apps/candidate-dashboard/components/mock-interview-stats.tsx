"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getCandidateMockInterviewStats } from "@/api/operations/mock-interview-api";
import { Trophy, TrendingUp, Award, Loader2, ClipboardList } from "lucide-react";
import { Badge } from "./ui/badge";

interface MockInterviewStats {
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
    recentAttempts: {
        id: string;
        title: string;
        status: string;
        created_at: string;
        role_category: string;
        score: number | null;
    }[];
}

export function MockInterviewStats() {
    const router = useRouter();
    const { token } = useAuthStore();
    const [stats, setStats] = useState<MockInterviewStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;

            setLoading(true);
            try {
                const response = await getCandidateMockInterviewStats(token);
                if (response?.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error("Error fetching mock interview stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Mock Interview Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!stats || stats.totalAttempts === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Mock Interview Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Start Your First Mock Interview</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Practice makes perfect! Take mock interviews to improve your skills.
                        </p>
                        <Button onClick={() => router.push("/mockinterview")}>
                            Browse Mock Interviews
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getRoleCategoryColor = (category: string) => {
        switch (category) {
            case "engineering":
                return "bg-primary/15 text-foreground border-primary/35";
            case "data_analytics":
                return "bg-secondary/85 text-secondary-foreground border-border/70";
            case "business":
                return "bg-accent/20 text-accent-foreground border-accent/35";
            default:
                return "bg-card/80 text-muted-foreground border-border/70";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-primary/15 text-foreground border-primary/35";
            case "in_progress":
                return "bg-secondary/85 text-secondary-foreground border-border/70";
            default:
                return "bg-card/80 text-muted-foreground border-border/70";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Mock Interview Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10">
                            <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                        <p className="text-xs text-muted-foreground">Total Attempts</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-accent/20">
                            <Award className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{stats.averageScore}</p>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-secondary/85">
                            <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{stats.completedAttempts}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                </div>

                {/* Recent Attempts */}
                {stats.recentAttempts.length > 0 && (
                    <div>
                        <h3 className="font-medium mb-3">Recent Attempts</h3>
                        <div className="space-y-2">
                            {stats.recentAttempts.map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => router.push(`/mockinterview/${attempt.id}`)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{attempt.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getRoleCategoryColor(attempt.role_category)}`}
                                                >
                                                    {attempt.role_category}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getStatusColor(attempt.status)}`}
                                                >
                                                    {attempt.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        {attempt.score !== null && (
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-primary">{attempt.score}</p>
                                                <p className="text-xs text-muted-foreground">score</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {new Date(attempt.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t space-y-2">
                    <Button
                        className="w-full"
                        onClick={() => router.push("/mockinterview")}
                    >
                        Start New Mock Interview
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push("/reports")}
                    >
                        View All Reports
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
