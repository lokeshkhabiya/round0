"use client";
import { getApplicationsForJob, getApplicationsShortlisted, sendInterviewInvitation } from "@/api/operations/job-applicants-api";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2, Users, Search, Filter, Send } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ApplicantCard, { Applicant, ShortlistedCandidate, ShortlistedCandidateCard } from "@/components/applicant-card";
import { useRouter } from "next/navigation";

interface Job {
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface Response {
    success: boolean;
    message: string;
    data: Applicant[];
    count: number;
    pendingCount: number;
    invitedCount: number;
    completedCount: number;
    acceptedCount: number;
    rejectedCount: number;
    job: Job;
}

interface ShortlistedResponse {
    success: boolean;
    message: string;
    data: ShortlistedCandidate[];
    count: number;
    countInterviewRoundByStatus: {
        completed: number;
        pending: number;
        started: number;
        error: number;
    };
}

const ViewApplicants = () => {
    // General state
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [isInvitationSent, setIsInvitationSent] = useState(false);
    const [activeTab, setActiveTab] = useState("total");

    // Tab 1: Total applicants state
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
    const [applicationsCount, setApplicationsCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [invitedCount, setInvitedCount] = useState(0);

    // Tab 2: Round 1 shortlisted state
    const [round1Candidates, setRound1Candidates] = useState<ShortlistedCandidate[]>([]);
    const [filteredRound1Candidates, setFilteredRound1Candidates] = useState<ShortlistedCandidate[]>([]);
    const [round1Stats, setRound1Stats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        started: 0,
        error: 0
    });

    // Tab 3: Round 2 shortlisted state
    const [round2Candidates, setRound2Candidates] = useState<ShortlistedCandidate[]>([]);
    const [filteredRound2Candidates, setFilteredRound2Candidates] = useState<ShortlistedCandidate[]>([]);
    const [round2Stats, setRound2Stats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        started: 0,
        error: 0
    });

    const params = useParams();
    const job_id = params.job_id?.[0] || "";
    const { token } = useAuthStore();
    const router = useRouter();

    // Fetch data based on active tab
    useEffect(() => {
        if (!token || !job_id) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                if (activeTab === "total") {
                    await fetchTotalApplicants();
                } else if (activeTab === "round1") {
                    await fetchRound1Candidates();
                } else if (activeTab === "round2") {
                    await fetchRound2Candidates();
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, job_id, activeTab]);

    const fetchTotalApplicants = async () => {
        const response: Response = await getApplicationsForJob(job_id, token);
        if (response?.success) {
            setApplicants(response?.data);
            setFilteredApplicants(response?.data);
            setJob(response?.job);
            setApplicationsCount(response?.count);
            setPendingCount(response?.pendingCount);
            setInvitedCount(response?.invitedCount);
        } else if (response?.success === false) {
            toast.error(response?.message);
        }
    };

    const fetchRound1Candidates = async () => {
        const response: ShortlistedResponse = await getApplicationsShortlisted(job_id, 1, "skill_assessment", token);
        if (response?.success) {
            setRound1Candidates(response?.data);
            setFilteredRound1Candidates(response?.data);
            setRound1Stats({
                total: response?.count,
                ...response?.countInterviewRoundByStatus
            });
        } else if (response?.success === false) {
            toast.error(response?.message);
        }
    };

    const fetchRound2Candidates = async () => {
        const response: ShortlistedResponse = await getApplicationsShortlisted(job_id, 2, "behavioral", token);
        if (response?.success) {
            setRound2Candidates(response?.data);
            setFilteredRound2Candidates(response?.data);
            setRound2Stats({
                total: response?.count,
                ...response?.countInterviewRoundByStatus
            });
        } else if (response?.success === false) {
            toast.error(response?.message);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        applyFilters(value, activeFilter);
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        applyFilters(searchTerm, filter);
    };

    const handleSendInterviewInvitation = async (round_number: string, round_type: string) => {
        try {
            const response = await sendInterviewInvitation(job_id, round_number, round_type, token);
            if (response?.success) {
                toast.success(response?.message);
                setIsInvitationSent(true);
                if (typeof window !== "undefined") {
                    window.location.reload();
                }
            } else if (response?.success === false) {
                toast.error(response?.message);
            }
        } catch (error) {
            console.error("Error sending interview invitation:", error);
        }
    };

    const applyFilters = (searchValue: string, statusFilter: string) => {
        if (activeTab === "total") {
            let filtered = applicants;
            if (searchValue) {
                filtered = filtered.filter(
                    (applicant) =>
                        applicant.candidate.name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()) ||
                        applicant.candidate.email
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                );
            }

            if (statusFilter !== "all") {
                filtered = filtered.filter(
                    (applicant) => applicant.status === statusFilter
                );
            }

            setFilteredApplicants(filtered);
        } else if (activeTab === "round1") {
            let filtered = round1Candidates;
            if (searchValue) {
                filtered = filtered.filter(
                    (candidate) =>
                        candidate.application.candidate.name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()) ||
                        candidate.application.candidate.email
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                );
            }

            if (statusFilter !== "all") {
                if (statusFilter === "pass" || statusFilter === "fail") {
                    // Filter by recruiter decision
                    filtered = filtered.filter(
                        (candidate) => candidate.interview_round[0]?.recruiter_decision === statusFilter
                    );
                } else if (statusFilter === "decision_pending") {
                    // Filter by recruiter decision pending
                    filtered = filtered.filter(
                        (candidate) => candidate.interview_round[0]?.recruiter_decision === "pending"
                    );
                } else if (statusFilter === "assessment_pending") {
                    // Filter by assessment status pending
                    filtered = filtered.filter(
                        (candidate) => candidate.interview_round[0]?.status === "pending"
                    );
                } else {
                    // Filter by assessment status (completed, started, etc.)
                    filtered = filtered.filter(
                        (candidate) => candidate.interview_round[0]?.status === statusFilter
                    );
                }
            }

            setFilteredRound1Candidates(filtered);
        } else if (activeTab === "round2") {
            let filtered = round2Candidates;
            if (searchValue) {
                filtered = filtered.filter(
                    (candidate) =>
                        candidate.application.candidate.name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()) ||
                        candidate.application.candidate.email
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                );
            }

            if (statusFilter !== "all") {
                if (statusFilter === "pass" || statusFilter === "fail") {
                    // Filter by recruiter decision
                    filtered = filtered.filter(
                        (candidate) => candidate.interview_round[0]?.recruiter_decision === statusFilter
                    );
                } else if (statusFilter === "decision_pending") {
                    // Filter by recruiter decision pending
                    filtered = filtered.filter(
                        (candidate) => candidate.interview_round[0]?.recruiter_decision === "pending"
                    );
                } else if (statusFilter === "assessment_pending") {
                    // Filter by assessment status pending
                    filtered = filtered.filter(
                        (candidate) => candidate.interview_round[0]?.status === "pending"
                    );
                } else {
                    // Filter by assessment status (completed, started, etc.)
                    filtered = filtered.filter(
                        (candidate) => candidate.interview_round[0]?.status === statusFilter
                    );
                }
            }

            setFilteredRound2Candidates(filtered);
        }
    };

    const handleApplicantStatusUpdate = (updatedApplicant: Applicant) => {
        const updateList = (list: Applicant[]) =>
            list.map((app) =>
                app.id === updatedApplicant.id ? updatedApplicant : app
            );

        setApplicants((prev) => updateList(prev));
        setFilteredApplicants((prev) => updateList(prev));

        const oldStatus = applicants.find((app) => app.id === updatedApplicant.id)?.status;
        if (oldStatus) {
            switch (oldStatus) {
                case "pending":
                    setPendingCount((prev) => prev - 1);
                    break;
                case "invited":
                    setInvitedCount((prev) => prev - 1);
                    break;
            }
        }

        switch (updatedApplicant.status) {
            case "pending":
                setPendingCount((prev) => prev + 1);
                break;
            case "invited":
                setInvitedCount((prev) => prev + 1);
                break;
        }
    };

    const handleCandidateDecisionUpdate = (updatedCandidate: ShortlistedCandidate) => {
        if (activeTab === "round1") {
            const updateList = (list: ShortlistedCandidate[]) =>
                list.map((candidate) =>
                    candidate.interview_round[0]?.id === updatedCandidate.interview_round[0]?.id 
                        ? updatedCandidate 
                        : candidate
                );

            setRound1Candidates((prev) => updateList(prev));
            setFilteredRound1Candidates((prev) => updateList(prev));
        } else if (activeTab === "round2") {
            const updateList = (list: ShortlistedCandidate[]) =>
                list.map((candidate) =>
                    candidate.interview_round[0]?.id === updatedCandidate.interview_round[0]?.id 
                        ? updatedCandidate 
                        : candidate
                );

            setRound2Candidates((prev) => updateList(prev));
            setFilteredRound2Candidates((prev) => updateList(prev));
        }
    };

    const getFilterOptions = () => {
        if (activeTab === "total") {
            return [
                { label: `All Candidates (${applicationsCount})`, value: "all" },
                { label: `Pending (${pendingCount})`, value: "pending" },
                { label: `Invited (${invitedCount})`, value: "invited" },
            ];
        } else {
            const stats = activeTab === "round1" ? round1Stats : round2Stats;
            return [
                { label: `All Candidates (${stats.total})`, value: "all" },
                { label: `Assessment Completed (${stats.completed})`, value: "completed" },
                { label: `Assessment Pending (${stats.pending})`, value: "assessment_pending" },
                { label: `Assessment Started (${stats.started})`, value: "started" },
                { label: `Decision: Pass`, value: "pass" },
                { label: `Decision: Fail`, value: "fail" },
                { label: `Decision: Pending`, value: "decision_pending" },
            ];
        }
    };

    const getStatsCards = () => {
        if (activeTab === "total") {
            return [
                { icon: Users, label: "Total Applicants", value: applicationsCount, color: "text-primary" },
                { icon: Users, label: "Pending", value: pendingCount, color: "text-yellow-600" },
                { icon: Users, label: "Invited", value: invitedCount, color: "text-blue-600" },
            ];
        } else {
            const stats = activeTab === "round1" ? round1Stats : round2Stats;
            const roundLabel = activeTab === "round1" ? "Round 1" : "Round 2";
            return [
                { icon: Users, label: `${roundLabel} Total`, value: stats.total, color: "text-primary" },
                { icon: Users, label: "Completed", value: stats.completed, color: "text-green-600" },
                { icon: Users, label: "Pending", value: stats.pending, color: "text-yellow-600" },
            ];
        }
    };

    const getCurrentData = () => {
        if (activeTab === "total") {
            return filteredApplicants;
        } else if (activeTab === "round1") {
            return filteredRound1Candidates;
        } else {
            return filteredRound2Candidates;
        }
    };

    const renderCandidateCards = () => {
        const currentData = getCurrentData();
        
        if (currentData.length === 0) {
            return (
                <div className="text-center text-muted-foreground py-12">
                    No candidates found.
                </div>
            );
        }

        if (activeTab === "total") {
            return (
                <div className="space-y-4">
                    {(currentData as Applicant[]).map((applicant) => (
                        <ApplicantCard
                            key={applicant.id}
                            applicant={applicant}
                            onStatusUpdate={handleApplicantStatusUpdate}
                        />
                    ))}
                </div>
            );
        } else {
            return (
                <div className="space-y-4">
                    {(currentData as ShortlistedCandidate[]).map((candidate, index) => (
                        <ShortlistedCandidateCard
                            key={`${candidate.interview_round[0]?.id}-${index}`}
                            candidate={candidate}
                            onDecisionUpdate={handleCandidateDecisionUpdate}
                        />
                    ))}
                </div>
            );
        }
    };

    return (
        <>
            {loading && (
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b bg-white">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold">Candidates</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Manage and review candidate applications
                        </p>
                    </div>
                </div>

                {activeTab === "total" && (
                    <div className="top-10 right-10 absolute">
                        <Button variant="outline" size="default" className="disabled:cursor-not-allowed cursor-pointer" disabled={invitedCount === 0 || isInvitationSent ? true : false} onClick={() => handleSendInterviewInvitation("1", "skill_assessment")} >
                            <Send className="h-4 w-4 mr-2" /> {isInvitationSent ? "Sent" : "Send Interview Invitation"}
                        </Button>
                    </div>
                )}

				
				{ activeTab === "round1" && (
					<div className="top-10 right-10 absolute">
						<Button variant="outline" size="default" className="disabled:cursor-not-allowed cursor-pointer" disabled={round1Candidates.length === 0 || isInvitationSent || !round1Candidates.some(candidate => candidate.interview_round[0]?.recruiter_decision === 'pass' || candidate.interview_round[0]?.recruiter_decision === 'fail')} onClick={() => handleSendInterviewInvitation("2", "behavioral")} >							<Send className="h-4 w-4 mr-2" /> {isInvitationSent ? "Sent" : "Send Interview Invitation"}
						</Button>
					</div>
				)}

                {/* Tabs Section */}
                <div className="container mx-auto px-4 py-6 max-w-5xl">
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                            onClick={() => setActiveTab("total")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                activeTab === "total"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Total Applicants
                        </button>
                        <button
                            onClick={() => setActiveTab("round1")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                activeTab === "round1"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Skill Assessment
                        </button>
                        <button
                            onClick={() => setActiveTab("round2")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                activeTab === "round2"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            behavioral Round
                        </button>
                    </div>
                </div>

                {/* Stats and Content */}
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Side - Stats Overview */}
                        <div className="lg:col-span-2">
                            {/* Stats cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {getStatsCards().map((stat, index) => (
                                    <div key={index} className="bg-white p-6 rounded-lg border h-full">
                                        <div className="flex items-center gap-2 mb-1">
                                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                            <span className="text-sm font-medium">
                                                {stat.label}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold">
                                            {stat.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Job Details */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg border h-full">
                                <h2 className="text-xl font-bold mb-4">
                                    Job Details
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary">
                                            {job?.title || "Job Title"}
                                        </h3>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {job?.description?.slice(0, 90) + "..." ||
                                                "No description available"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="my-8 space-y-4 ">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search candidates by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline" size="default">
                                <Filter className="h-4 w-4 mr-2" />
                                Advanced Filters
                            </Button>
                        </div>

                        {/* Status Filters */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Filter by {activeTab === "total" ? "Status" : "Decision"}:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {getFilterOptions().map((option) => (
                                    <Badge
                                        key={option.value}
                                        variant={
                                            activeFilter === option.value
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                        onClick={() => handleFilterChange(option.value)}
                                    >
                                        {option.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Candidates List */}
                    <div className="mt-10">
                        <h2 className="text-xl font-bold mb-4">
                            {activeTab === "total" 
                                ? "Applicants" 
                                : activeTab === "round1" 
                                    ? "Skill Assessment Candidates" 
                                    : " Round Candidates"
                            }
                        </h2>
                        {renderCandidateCards()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewApplicants;
