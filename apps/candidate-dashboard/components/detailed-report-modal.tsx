import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Loader2, Calendar, Clock, Brain, MessageSquare, Lightbulb, Users, Cog, FileText } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DetailedReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportData: ReportData | null;
    loading: boolean;
}

interface ReportData {
    zero_score: number;
    score_components: string;
    ai_summary: string;
    report_data: string;
    report_generated_at: string;
    recruiter_decision: string;
}

const DetailedReportModal = ({
    isOpen,
    onClose,
    reportData,
    loading,
}: DetailedReportModalProps) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreComponents = () => {
        if (!reportData?.score_components) return {};
        try {
            return JSON.parse(reportData.score_components);
        } catch {
            return {};
        }
    };

    const getReportData = () => {
        if (!reportData?.report_data) return null;
        try {
            return JSON.parse(reportData.report_data);
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-6xl w-full max-h-[95vh] h-full overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Mock Interview Assessment Report
                    </DialogTitle>
                    <DialogDescription>
                        Your detailed performance analysis and feedback from this mock interview attempt.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin h-8 w-8" />
                        <span className="ml-2">Loading your report...</span>
                    </div>
                ) : reportData ? (
                    <div className="space-y-6">
                        {/* Overall Score Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Overall Performance Score</span>
                                    <Badge variant={getDecisionBadgeVariant(reportData.recruiter_decision)}>
                                        {reportData.recruiter_decision.charAt(0).toUpperCase() + 
                                         reportData.recruiter_decision.slice(1)}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4">
                                    <div className="text-4xl font-bold">
                                        <span className={getScoreColor(reportData.zero_score)}>
                                            {reportData.zero_score}
                                        </span>
                                        <span className="text-2xl text-muted-foreground">/100</span>
                                    </div>
                                    <div className="flex-1">
                                        <Progress 
                                            value={reportData.zero_score} 
                                            className="h-3"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Score Components */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Skill Assessment Breakdown</CardTitle>
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
                                    <span>AI Performance Summary</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-900 leading-relaxed">
                                        {reportData.ai_summary}
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
                                        <span>Detailed Performance Feedback</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(reportDataDetails).filter(([key]) => 
                                            key !== 'comments' && key !== 'overall_score'
                                        ).map(([key, value]) => (
                                            <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    {componentIcons[key as keyof typeof componentIcons]}
                                                    <h4 className="font-semibold text-lg capitalize text-gray-800">
                                                        {key.replace('_', ' ')}
                                                    </h4>
                                                </div>
                                                <div className="bg-gray-50 rounded-md p-3 border-l-4 border-blue-500">
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {value as string}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Comments */}
                                        {reportDataDetails.comments && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                <h4 className="font-semibold text-amber-800 mb-2">Additional Feedback</h4>
                                                <p className="text-amber-900 leading-relaxed">
                                                    {reportDataDetails.comments}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Report Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Report Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Report Generated</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(reportData.report_generated_at)}
                                        </p>
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