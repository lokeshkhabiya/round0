"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Briefcase } from "lucide-react"
import { JobPosting } from "./job-postings"


interface JobCardProps {
  job: JobPosting
  onViewJob: (jobId: string) => void
}

export function JobCard({ job, onViewJob }: JobCardProps) {
  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left side - Job Information */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{job?.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{job?.description.length > 300 ? job?.description.slice(0, 300) + "..." : job?.description}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Recruiter: {job?.recruiter?.name}</span>
            </div>
          </div>

          {/* Right side - Apply Button */}
          <div className="flex-shrink-0">
            <Button onClick={() => onViewJob(job?.id)} size="lg" className="px-8">
              {/* <Briefcase className="h-4 w-4 mr-2" /> */}
              View Job
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
