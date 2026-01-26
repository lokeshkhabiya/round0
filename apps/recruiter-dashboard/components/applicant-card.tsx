import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import React, { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateApplicationStatus, updateRecruiterDecision } from "@/api/operations/job-applicants-api";
import { useAuthStore } from "@/stores/auth-store";
import DetailedReportModal from "./detailed-report-modal";

export interface Applicant {
    id: string;
    candidate_id: string;
    job_description_id: string;
    applied_at: string;
    status: string;
    candidate: {
        id: string;
        name: string;
        email: string;
        imageUrl: string;
    };
}

export interface ShortlistedCandidate {
    application: {
        candidate: {
            id: string;
            name: string;
            email: string;
            imageUrl: string | null;
        };
    };
    interview_round: Array<{
        id: string;
        session_id: string;
        round_number: number;
        round_type: string;
        status: string;
        recording_url: string | null;
        started_at: string | null;
        end_at: string | null;
        zero_score: number | null;
        score_components: string;
        ai_summary: string | null;
        report_data: string;
        report_generated_at: string | null;
        recruiter_decision: string;
    }>;
}

// Status options for the dropdown
const STATUS_OPTIONS = [
    { label: "Pending", value: "pending" },
    { label: "Invited", value: "invited" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
];

// Decision options for shortlisted candidates
const DECISION_OPTIONS = [
    { label: "Pending", value: "pending" },
    { label: "Pass", value: "pass" },
    { label: "Fail", value: "fail" },
];

// Status badge color mapping
const statusBadgeMap: Record<
    string,
    { color: string; label: string; badgeVariant?: "default" | "secondary" | "outline" }
> = {
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending", badgeVariant: "secondary" },
    invited: { color: "bg-blue-100 text-blue-800", label: "Invited", badgeVariant: "secondary" },
    in_progress: { color: "bg-orange-100 text-orange-800", label: "In Progress", badgeVariant: "secondary" },
    completed: { color: "bg-purple-100 text-purple-800", label: "Completed", badgeVariant: "secondary" },
    accepted: { color: "bg-green-100 text-green-800", label: "Accepted", badgeVariant: "secondary" },
    rejected: { color: "bg-red-100 text-red-800", label: "Rejected", badgeVariant: "secondary" },
    started: { color: "bg-indigo-100 text-indigo-800", label: "Started", badgeVariant: "secondary" },
    pass: { color: "bg-green-100 text-green-800", label: "Pass", badgeVariant: "secondary" },
    fail: { color: "bg-red-100 text-red-800", label: "Fail", badgeVariant: "secondary" },
};

interface ApplicantCardProps {
    applicant: Applicant;
    onStatusUpdate?: (updatedApplicant: Applicant) => void;
}

interface ShortlistedCandidateCardProps {
    candidate: ShortlistedCandidate;
    onDecisionUpdate?: (updatedCandidate: ShortlistedCandidate) => void;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({ applicant, onStatusUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const { token } = useAuthStore();

    // Helper to get badge color and label
    const getStatusBadge = (status: string) => {
        const map = statusBadgeMap[status] || {
            color: "bg-gray-100 text-gray-800",
            label: status?.charAt(0).toUpperCase() + status.slice(1),
            badgeVariant: "secondary",
        };
        return (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map.color}`}
            >
                {map.label}
            </span>
        );
    };

    // Handle status update
    const handleStatusUpdate = async (newStatus: string) => {
        if (newStatus === applicant.status) return;
        
        setIsUpdating(true);
        try {
            const response = await updateApplicationStatus(applicant.id, newStatus, token);
            if (response?.success) {
                toast.success("Status updated successfully");
                if (onStatusUpdate) {
                    onStatusUpdate({
                        ...applicant,
                        status: newStatus,
                    });
                }
            } else {
                toast.error(response?.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred while updating status");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div
            key={applicant.id}
            className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white border rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow min-h-[120px]"
        >
            <div className="flex items-center gap-6 flex-1">
                {applicant.candidate.imageUrl ? (
                    <img
                        src={applicant.candidate.imageUrl}
                        alt={applicant.candidate.name}
                        className="w-16 h-16 rounded-full object-cover border border-gray-200"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-xl text-gray-900">
                            {applicant.candidate.name}
                        </span>
                        {getStatusBadge(applicant.status)}
                    </div>
                    <div className="text-base text-gray-600">
                        {applicant.candidate.email}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                        Applied on{" "}
                        {new Date(
                            applicant.applied_at
                        ).toLocaleDateString()}
                    </div>
                </div>
            </div>
            {/* Right: Actions */}
            <div className="flex flex-row md:flex-col gap-3 mt-6 md:mt-0 md:ml-10">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-4 py-2 text-base cursor-pointer"
                >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">View Candidate</span>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2 px-4 py-2 text-base cursor-pointer"
                            disabled={isUpdating}
                        >
                            <span className="text-sm">
                                {isUpdating ? "Updating..." : "Update Status"}
                            </span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {STATUS_OPTIONS.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleStatusUpdate(option.value)}
                                disabled={isUpdating || applicant.status === option.value}
                                className={
                                    applicant.status === option.value
                                        ? "bg-accent text-accent-foreground"
                                        : ""
                                }
                            >
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export const ShortlistedCandidateCard: React.FC<ShortlistedCandidateCardProps> = ({ candidate, onDecisionUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const { token } = useAuthStore();
    const [isViewingDetailedReport, setIsViewingDetailedReport] = useState(false);
    
    const round = candidate.interview_round?.[0]; // Get the first round safely
    const isAssessmentCompleted = round?.status === "completed";

    // Helper to get badge color and label
    const getStatusBadge = (status: string | null | undefined, variant: "status" | "decision" = "status") => {
        // Check if status is null, undefined, or empty string
        if (!status) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {variant === "status" ? "No Status" : "Pending Decision"}
                </span>
            );
        }
        
        const map = statusBadgeMap[status] || {
            color: "bg-gray-100 text-gray-800",
            label: status.charAt(0).toUpperCase() + status.slice(1),
            badgeVariant: "secondary",
        };
        return (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map.color}`}
            >
                {map.label}
            </span>
        );
    };

    // Handle decision update
    const handleDecisionUpdate = async (newDecision: string) => {
        if (!round || newDecision === round.recruiter_decision) return;
        
        setIsUpdating(true);
        try {
            const response = await updateRecruiterDecision(round.id, newDecision, token);
            if (response?.success) {
                toast.success("Decision updated successfully");
                if (onDecisionUpdate) {
                    const updatedCandidate = {
                        ...candidate,
                        interview_round: [{
                            ...round,
                            recruiter_decision: newDecision
                        }]
                    };
                    onDecisionUpdate(updatedCandidate);
                }
            } else {
                toast.error(response?.message || "Failed to update decision");
            }
        } catch (error) {
            toast.error("An error occurred while updating decision");
        } finally {
            setIsUpdating(false);
        }
    };

    const formatScore = (score: number | null) => {
        if (score === null) return "N/A";
        return `${score}/100`;
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return "text-gray-500";
        if (score >= 80) return "text-green-600 font-semibold";
        if (score >= 60) return "text-yellow-600 font-semibold";
        return "text-red-600 font-semibold";
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Not started";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRecommendation = () => {
        if (!round) return { text: "No data available", color: "text-gray-500" };
        
        const score = round.zero_score;
        const status = round.status;
        const decision = round.recruiter_decision;
        
        if (decision === "pass") return { text: "Recommended ✓", color: "text-green-600" };
        if (decision === "fail") return { text: "Not Recommended ✗", color: "text-red-600" };
        
        if (status !== "completed") return { text: "Assessment Pending", color: "text-yellow-600" };
        
        if (score === null) return { text: "Score Unavailable", color: "text-gray-500" };
        if (score >= 80) return { text: "Highly Recommended ⭐", color: "text-green-600" };
        if (score >= 60) return { text: "Moderately Recommended", color: "text-yellow-600" };
        return { text: "Needs Review", color: "text-orange-600" };
    };

    const recommendation = getRecommendation();

    const handleViewDetailedReport = () => {
        setIsViewingDetailedReport(true);
    };

    return (
        <div
            className="bg-white border rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
        >
            {/* Header with candidate info and recommendation */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    {candidate.application.candidate.imageUrl ? (
                        <img
                            src={candidate.application.candidate.imageUrl}
                            alt={candidate.application.candidate.name}
                            className="w-16 h-16 rounded-full object-cover border border-gray-200"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border border-gray-200">
                            <span className="text-blue-600 font-semibold text-lg">
                                {candidate.application.candidate.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-xl text-gray-900">
                            {candidate.application.candidate.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                            {candidate.application.candidate.email}
                        </p>
                    </div>
                </div>
                <div className={`text-right ${recommendation.color}`}>
                    <p className="text-sm font-medium">{recommendation.text}</p>
                </div>
            </div>

            {/* Assessment Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Assessment Round</p>
                    <p className="text-sm font-semibold text-gray-900">
                        Round {round?.round_number || "N/A"} - {round?.round_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Unknown"}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Assessment Status</p>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(round?.status, "status")}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Your Decision</p>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(round?.recruiter_decision, "decision")}
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-white border rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Assessment Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(round?.zero_score)}`}>
                        {formatScore(round?.zero_score)}
                    </p>
                </div>
                <div className="text-center p-3 bg-white border rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Started At</p>
                    <p className="text-sm text-gray-700">
                        {formatDate(round?.started_at)}
                    </p>
                </div>
                <div className="text-center p-3 bg-white border rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Completed At</p>
                    <p className="text-sm text-gray-700">
                        {formatDate(round?.end_at)}
                    </p>
                </div>
            </div>

            {/* AI Summary Section */}
            {round?.ai_summary && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">AI Assessment Summary</p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                        {round.ai_summary.length > 200 
                            ? `${round.ai_summary.substring(0, 200)}...` 
                            : round.ai_summary
                        }
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer flex-1"
                    disabled={!round || !isAssessmentCompleted}
                    onClick={handleViewDetailedReport}
                >
                    <Eye className="h-4 w-4" />
                    View Detailed Report
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={round?.recruiter_decision === "shortlisted" ? "default" : 
                                    round?.recruiter_decision === "rejected" ? "destructive" : "secondary"}
                            size="sm"
                            className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer flex-1"
                            disabled={isUpdating || !round || !isAssessmentCompleted}
                        >
                            <span>
                                {isUpdating ? "Updating..." : "Make Decision"}
                            </span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {DECISION_OPTIONS.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleDecisionUpdate(option.value)}
                                disabled={isUpdating || !round || round.recruiter_decision === option.value}
                                className={
                                    round?.recruiter_decision === option.value
                                        ? "bg-accent text-accent-foreground"
                                        : ""
                                }
                            >
                                <span className="flex items-center justify-between w-full">
                                    {option.label}
                                    {round?.recruiter_decision === option.value && (
                                        <span className="text-xs">✓</span>
                                    )}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Render the detailed report modal */}
            {isViewingDetailedReport && round?.id && (
                <DetailedReportModal 
                    isOpen={isViewingDetailedReport}
                    setIsViewingDetailedReport={setIsViewingDetailedReport}
                    round_id={round?.id || ""}
                />
            )}
        </div>
    );
};

export default ApplicantCard;
