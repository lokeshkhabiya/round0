import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { getReport } from "@/api/operations/report-api";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2, Calendar, Clock, Video, Volume2, Brain, MessageSquare, Lightbulb, Users, Cog, FileText } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DetailedReportModalProps {
    isOpen: boolean;
    setIsViewingDetailedReport: (isViewing: boolean) => void;
    round_id: string;
}

interface ReportData {
    zero_score: number;
    score_components: string;
    ai_summary: string;
    report_data: string;
    report_generated_at: string;
    recruiter_decision: string;
    decision_at: string;
}

interface VideoAudioData {
    video: string;
    audio: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    report: ReportData;
    videoAndAudioData: VideoAudioData;
}

const DetailedReportModal = ({
    isOpen,
    setIsViewingDetailedReport,
    round_id,
}: DetailedReportModalProps) => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ApiResponse | null>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        const getCandidateReport = async () => {
            try {
                setLoading(true);
                const response = await getReport(round_id, token);
                setReportData(response);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && round_id) {
            getCandidateReport();
        }
    }, [round_id, token, isOpen]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-primary";
        if (score >= 60) return "text-foreground";
        return "text-destructive";
    };

    const getScoreComponents = () => {
        if (!reportData?.report?.score_components) return {};
        try {
            return JSON.parse(reportData.report.score_components);
        } catch {
            return {};
        }
    };

    const getReportData = () => {
        if (!reportData?.report?.report_data) return null;
        try {
            // Parse the outer JSON string first
            const outerParsed = JSON.parse(reportData.report.report_data);
            // Then parse the inner JSON string
            return JSON.parse(outerParsed);
        } catch {
            return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDecisionBadgeVariant = (decision: string) => {
        switch (decision) {
            case 'shortlisted': return 'default';
            case 'rejected': return 'destructive';
            default: return 'secondary';
        }
    };

    const scoreComponents = getScoreComponents();
    const reportDataDetails = getReportData();
    const componentIcons = {
        technical_skills: <Cog className="h-4 w-4" />,
        communication: <MessageSquare className="h-4 w-4" />,
        reasoning: <Brain className="h-4 w-4" />,
        creativity: <Lightbulb className="h-4 w-4" />,
        cultural_fit: <Users className="h-4 w-4" />
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsViewingDetailedReport}>
            <DialogContent className="max-w-[95vw] sm:max-w-6xl w-full max-h-[95vh] h-full overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Detailed Assessment Report
                    </DialogTitle>
                    <DialogDescription>
                        Comprehensive assessment details and performance metrics for this candidate.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin h-8 w-8" />
                        <span className="ml-2">Loading report...</span>
                    </div>
                ) : reportData ? (
                    <div className="space-y-6">
                        {/* Overall Score Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Overall Assessment Score</span>
                                    <Badge variant={getDecisionBadgeVariant(reportData.report.recruiter_decision)}>
                                        {reportData.report.recruiter_decision.charAt(0).toUpperCase() + 
                                         reportData.report.recruiter_decision.slice(1)}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4">
                                    <div className="text-4xl font-bold">
                                        <span className={getScoreColor(reportData.report.zero_score)}>
                                            {reportData.report.zero_score}
                                        </span>
                                        <span className="text-2xl text-muted-foreground">/100</span>
                                    </div>
                                    <div className="flex-1">
                                        <Progress 
                                            value={reportData.report.zero_score} 
                                            className="h-3"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Score Components */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Skill Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(scoreComponents).map(([skill, score]) => (
                                        <div key={skill} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {componentIcons[skill as keyof typeof componentIcons]}
                                                    <span className="text-sm font-medium capitalize">
                                                        {skill.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <span className={`text-sm font-bold ${getScoreColor(score as number)}`}>
                                                    {score as number}%
                                                </span>
                                            </div>
                                            <Progress value={score as number} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Brain className="h-5 w-5" />
                                    <span>AI Assessment Summary</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-primary/8 border border-primary/25 rounded-xl p-4">
                                    <p className="text-foreground leading-relaxed">
                                        {reportData.report.ai_summary}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detailed Report Data */}
                        {reportDataDetails && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5" />
                                        <span>Detailed Assessment Feedback</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Detailed Feedback for Each Category */}
                                        <div className="space-y-4">
                                            {Object.entries(reportDataDetails).filter(([key]) => 
                                                key !== 'comments' && key !== 'overall_score' && typeof reportDataDetails[key] === 'string'
                                            ).map(([key, value]) => (
                                                <div key={key} className="border border-border/60 rounded-2xl p-4 bg-card/76">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        {componentIcons[key as keyof typeof componentIcons]}
                                                        <h4 className="font-semibold text-lg capitalize text-foreground">
                                                            {key.replace('_', ' ')}
                                                        </h4>
                                                    </div>
                                                    <div className="bg-muted/40 rounded-xl p-3 border-l-4 border-primary/45">
                                                        <p className="text-foreground leading-relaxed">
                                                            {value as string}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Score Breakdown from Report Data (if numerical values exist) */}
                                        {Object.entries(reportDataDetails).some(([key, value]) => 
                                            key !== 'comments' && key !== 'overall_score' && typeof value === 'number'
                                        ) && (
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3">Score Breakdown</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {Object.entries(reportDataDetails).filter(([key, value]) => 
                                                        key !== 'comments' && key !== 'overall_score' && typeof value === 'number'
                                                    ).map(([key, value]) => (
                                                        <div key={key} className="bg-muted/40 rounded-xl p-3 border border-border/55">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium capitalize">
                                                                    {key.replace('_', ' ')}
                                                                </span>
                                                                <span className={`text-sm font-bold ${getScoreColor(value as number)}`}>
                                                                    {value as number}%
                                                                </span>
                                                            </div>
                                                            <Progress value={value as number} className="h-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Overall Score from Report Data */}
                                        {reportDataDetails.overall_score && (
                                            <div className="bg-card/78 border border-border/60 rounded-xl p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-lg">Overall Assessment Score</span>
                                                    <span className={`text-2xl font-bold ${getScoreColor(reportDataDetails.overall_score)}`}>
                                                        {reportDataDetails.overall_score}%
                                                    </span>
                                                </div>
                                                <Progress value={reportDataDetails.overall_score} className="h-3 mt-2" />
                                            </div>
                                        )}

                                        {/* Comments */}
                                        {reportDataDetails.comments && (
                                            <div className="bg-secondary/55 border border-border/60 rounded-xl p-4">
                                                <h4 className="font-semibold text-foreground mb-2">Additional Assessment Comments</h4>
                                                <p className="text-foreground leading-relaxed">
                                                    {reportDataDetails.comments}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Interview Recordings */}
                        {reportData.videoAndAudioData &&  <Card>
                            <CardHeader>
                                <CardTitle>Interview Recordings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Video Recording */}
                                    {reportData.videoAndAudioData?.video &&  <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Video className="h-5 w-5" />
                                            <span className="font-medium text-lg">Video Recording</span>
                                        </div>
                                        <div className="w-full">
                                            <video 
                                                controls 
                                                className="w-full max-h-96 rounded-xl border border-border/60"
                                                preload="metadata"
                                            >
                                                <source src={reportData.videoAndAudioData?.video} type="video/mp4" />
                                                <source src={reportData.videoAndAudioData?.video} type="video/webm" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>}

                                    {/* Audio Recording */}
                                    {reportData.videoAndAudioData?.audio && (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Volume2 className="h-5 w-5" />
                                                <span className="font-medium text-lg">Audio Recording</span>
                                            </div>
                                            <div className="w-full">
                                                <audio 
                                                    controls 
                                                    className="w-full"
                                                    preload="metadata"
                                                >
                                                    <source src={reportData.videoAndAudioData.audio} type="audio/mpeg" />
                                                    <source src={reportData.videoAndAudioData.audio} type="audio/wav" />
                                                    <source src={reportData.videoAndAudioData.audio} type="audio/ogg" />
                                                    Your browser does not support the audio tag.
                                                </audio>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>}

                        {/* Report Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Report Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Report Generated</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(reportData.report.report_generated_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Decision Made</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(reportData.report.decision_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-muted-foreground">No report data available</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DetailedReportModal;
