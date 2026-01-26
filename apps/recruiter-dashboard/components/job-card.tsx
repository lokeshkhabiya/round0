import React from "react";
import { jobPosting } from "./job-listing";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { User, Edit } from "lucide-react";

interface JobCardProps {
    job: jobPosting;
    onEditJob: (job_id: string) => void;
	onViewApplicants: (job_id: string) => void;
}

const JobCard = ({ job, onEditJob, onViewApplicants }: JobCardProps) => {
    return (
        <Card className="w-full hover:shadow-md transition-shadow">
			<div className="flex justify-end items-start px-8">
				<Edit 
					className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" 
					onClick={() => onEditJob(job.id)}
				/>
			</div>
            <CardContent className="pb-6">
                <div className="flex items-center justify-between gap-6">
                    {/* Left side - Job Information */}
                    <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {job.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {job.description.length > 250 ? job.description.slice(0,250) + "..." : job.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{job?.recruiter?.name}</span>
                        </div>
                    </div>

                    <div className="flex-shrink-0 relative">
                        <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-4 w-4" />
                            <span>
                                Candidates:{" "}
                                {job?._count?.candidate_applications}
                            </span>
                        </div>
                        <Button size="lg" className="px-8 cursor-pointer" onClick={() => onViewApplicants(job.id)}>
                            View Applicants
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default JobCard;
