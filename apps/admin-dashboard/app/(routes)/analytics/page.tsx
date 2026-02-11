"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { getMockInterviewAnalytics } from "@/api/operations/mockinterview-api";
import {
    TrendingUp,
    Users,
    Target,
    Award,
    Loader2,
    BarChart3,
    Trophy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AnalyticsData {
    totalMockInterviews: number;
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
    completionRate: number;
    rolePerformance: {
        role: string;
        averageScore: number;
        attempts: number;
    }[];
    leaderboard: {
        id: string;
        name: string;
        averageScore: number;
        totalAttempts: number;
    }[];
}

const AnalyticsPage = () => {
    const { token } = useAuthStore();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!token) return;

            setLoading(true);
            try {
                const response = await getMockInterviewAnalytics(token);
                if (response?.success) {
                    setAnalytics(response.data);
                } else {
                    toast.error(response?.message || "Failed to load analytics");
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
                toast.error("Error loading analytics");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [token]);

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

    const getRoleCategoryLabel = (category: string) => {
        switch (category) {
            case "engineering":
                return "Engineering";
            case "data_analytics":
                return "Data & Analytics";
            case "business":
                return "Business";
            case "other":
                return "Other";
            default:
                return category;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto" />
                    <p className="mt-4 text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">No analytics data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4">
            {/* Header */}
            <div className="border-b border-border/55 bg-background/70 backdrop-blur-xl mb-4">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Mock Interview Analytics</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Platform-wide statistics and performance metrics
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Mock Interviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">{analytics.totalMockInterviews}</div>
                                <Target className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Attempts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">{analytics.totalAttempts}</div>
                                <Users className="h-8 w-8 text-accent" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Average Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">{analytics.averageScore}%</div>
                                <Award className="h-8 w-8 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Completion Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">{analytics.completionRate}%</div>
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Role Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Performance by Role Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics.rolePerformance.length > 0 ? (
                                <div className="space-y-4">
                                    {analytics.rolePerformance.map((roleData, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${getRoleCategoryColor(roleData.role)}`}
                                                    >
                                                        {getRoleCategoryLabel(roleData.role)}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {roleData.attempts} attempts
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold">
                                                    {roleData.averageScore}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-secondary rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${roleData.averageScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No role performance data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Candidate Leaderboard */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Top Performers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics.leaderboard.length > 0 ? (
                                <div className="space-y-3">
                                    {analytics.leaderboard.map((candidate, index) => (
                                        <div
                                            key={candidate.id}
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                                        index === 0
                                                            ? "bg-primary text-primary-foreground"
                                                            : index === 1
                                                                ? "bg-secondary text-secondary-foreground"
                                                                : index === 2
                                                                    ? "bg-accent/20 text-accent-foreground"
                                                                    : "bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{candidate.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {candidate.totalAttempts} attempts
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-primary">
                                                    {candidate.averageScore}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">avg score</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No leaderboard data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Completion Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">
                                    {analytics.completedAttempts}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Completed Attempts
                                </p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-foreground">
                                    {analytics.totalAttempts - analytics.completedAttempts}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    In Progress / Abandoned
                                </p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-accent">
                                    {analytics.totalAttempts > 0
                                        ? (analytics.totalAttempts / analytics.totalMockInterviews).toFixed(1)
                                        : 0}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Avg Attempts per Interview
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;
