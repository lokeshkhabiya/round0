"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApplicationStatusBadge } from "@/components/application-status-badge"
import { Calendar, Clock, Eye, FileText } from "lucide-react"
export interface Application {
    id: string
    candidate_id: string
    job_description_id: string
    applied_at: string
    status: string
    created_at: string
    updated_at: string
    job_description: {
      id: string
      title: string
      description: string
    }
  }
  
  export interface ApplicationsResponse {
    success: boolean
    message: string
    data: Application[]
  }
  

interface MyApplicationCardProps {
  application: Application
  onViewJob: (jobId: string) => void
  onViewApplication: (applicationId: string) => void
}

export function MyApplicationCard({ application, onViewJob, onViewApplication }: MyApplicationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeSinceApplication = (dateString: string) => {
    const now = new Date()
    const appliedDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{application.job_description.title}</CardTitle>
              <ApplicationStatusBadge status={application.status} />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {application.job_description.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Application Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <div>
              <span className="font-medium">Applied:</span>
              <div>{formatDate(application.applied_at)}</div>
              <div className="text-xs">{getTimeSinceApplication(application.applied_at)}</div>
            </div>
          </div>

          {application.updated_at !== application.created_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <div>
                <span className="font-medium">Last Updated:</span>
                <div>{formatDateTime(application.updated_at)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Application ID */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <span className="font-medium">Application ID:</span> {application.id}
        </div>

        {/* Action Buttons */}
        {/* <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewJob(application.job_description.id)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Job Details
          </Button>

          <Button size="sm" onClick={() => onViewApplication(application.id)} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View Application
          </Button>
        </div> */}
      </CardContent>
    </Card>
  )
}
