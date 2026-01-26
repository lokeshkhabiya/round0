"use client";
import { getJobsPostedByRecruiter } from "@/api/operations/job-posting-api";
import { useAuthStore } from "@/stores/auth-store";
import { Briefcase, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import JobCard from "./job-card";

export interface jobPosting {
    id: string;
    title: string;
    description: string;
    recruiter: {
        name: string;
    };
    _count: {
        candidate_applications: number;
    };
}

const JobListing = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [jobData, setJobData] = useState<jobPosting[]>([]);
    const [filteredJobs, setFilteredJobs] = useState(jobData);
    const [loading, setLoading] = useState(true);
    const { token } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        try {
            setLoading(true);
            const getJobPostedByRecruiter = async () => {
                const response = await getJobsPostedByRecruiter(token);
                if (response?.success === true) {
                    setJobData(response?.data);
                    setFilteredJobs(response?.data);
                }
            };
            getJobPostedByRecruiter();
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term.trim() === "") {
            setFilteredJobs(jobData);
        } else {
            const filtered = jobData.filter((job) => {
                const titleMatch = job.title
                    .toLowerCase()
                    .includes(term.toLowerCase());
                const descriptionMatch = job.description
                    .toLowerCase()
                    .includes(term.toLowerCase());

                return titleMatch || descriptionMatch;
            });
            setFilteredJobs(filtered);
        }
    };

	const handleEditJob = (job_id: string) => {
		router.push(`/jobs/edit-job/${job_id}`)
	}

	const handleViewApplicants = (job_id: string) => {
		router.push(`/jobs/view-applicants/${job_id}`)
	}

    return (
		<>
		{ loading ? (
			<div className="flex justify-center items-center h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		) : (
        <div className="min-h-screen bg-background ">
            {/* Header */}
            <div className="border-b bg-white flex justify-between items-center">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Briefcase className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">ZeroCV Recruiter</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Check the list of all jobs you have posted as a
                        recruiter.
                    </p>
                </div>
				<div className="flex justify-end mr-6">
					<Button onClick={() => router.push("/jobs/create-job")} className="cursor-pointer bg-green-500 hover:bg-green-600 text-white">
						Create New Job
					</Button>	
				</div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Search and Filter Section */}
                <div className="mb-8 space-y-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search jobs by title, description, or recruiter..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-muted-foreground">
                        Showing {filteredJobs.length} of {jobData.length} jobs
                        {searchTerm && !searchTerm.startsWith("Recruiter:") && (
                            <span> for "{searchTerm}"</span>
                        )}
                    </p>
                    {filteredJobs.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {filteredJobs.length} position
                            {filteredJobs.length !== 1 ? "s" : ""} available
                        </p>
                    )}
                </div>

                {/* Job Cards List */}
                {filteredJobs.length > 0 ? (
                    <div className="space-y-4">
                        {filteredJobs.map((job) => (
                            <JobCard key={job.id} job={job} onEditJob={handleEditJob} onViewApplicants={handleViewApplicants}/>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No jobs created yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Try adjusting your search terms or browse all
                            available jobs posted by you.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                handleSearch("");
                                setFilteredJobs(jobData);
                            }}
                        >
                            Clear Search
                        </Button>
                    </div>
                )}
            </div>
        </div>
		)}
		</>
    );
};

export default JobListing;
