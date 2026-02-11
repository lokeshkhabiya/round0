"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApplicationCard } from "./application-card"
import {
  User,
  Mail,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MessageCircle,
  Download,
  Briefcase,
  Users,
} from "lucide-react"

export interface InterviewRound {
  id: string
  round_number: number
  round_type: string
  status: string
}

export interface InterviewSession {
  interview_round: InterviewRound[]
}

export interface CandidateApplication {
  status: string
  job_description: {
    id: string
    title: string
    description: string
  }
  interview_session: InterviewSession[]
}

export interface CandidateDetail {
  id: string
  email: string
  name: string
  role: string
  _count: {
    candidate_applications: number
  }
  candidate_applications: CandidateApplication[]
}

export interface CandidateDetailResponse {
  success: boolean
  message: string
  data: CandidateDetail
}

interface CandidateProfileProps {
  candidate: CandidateDetail
  onBack: () => void
  onViewJob: (jobId: string) => void
  onViewRound: (roundId: string, roundNumber: number, roundType: string) => void

}

export function CandidateProfile({ candidate, onBack, onViewJob, onViewRound}: CandidateProfileProps) {
  const getApplicationStats = () => {
    const applications = candidate?.candidate_applications || []
    const pending = applications.filter((app) => app.status === "pending").length || 0
    const invited = applications.filter((app) => app.status === "invited").length || 0
    const inProgress = applications.filter((app) => app.status === "in_progress").length || 0
    const completed = applications.filter((app) => app.status === "completed").length || 0
    const accepted = applications.filter((app) => app.status === "accepted").length || 0
    const rejected = applications.filter((app) => app.status === "rejected").length || 0

    return { pending, invited, inProgress, completed, accepted, rejected, total: applications.length || 0 }
  }

  const getInterviewStats = () => {
    let totalRounds = 0
    let totalInterviews = 0
    let applicationsWithInterviews = 0

    candidate?.candidate_applications?.forEach((app) => {
      if (app.interview_session && app.interview_session.length > 0) {
        applicationsWithInterviews++
        app.interview_session.forEach((session) => {
          totalInterviews++
          totalRounds += session.interview_round?.length || 0
        })
      }
    })

    return { totalRounds: totalRounds || 0, totalInterviews: totalInterviews || 0, applicationsWithInterviews: applicationsWithInterviews || 0 }
  }

  const stats = getApplicationStats()
  const interviewStats = getInterviewStats()

  const getUniqueJobTitles = () => {
    const titles = candidate?.candidate_applications?.map((app) => app.job_description?.title).filter(Boolean) || []
    return [...new Set(titles)]
  }

  const uniqueJobTitles = getUniqueJobTitles()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/55 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Candidates
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{candidate?.name}</h1>
              <p className="text-muted-foreground">Candidate Profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href={`mailto:${candidate?.email}`} className="text-sm text-primary hover:underline">
                      {candidate?.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <Badge variant="secondary" className="mt-1">
                      {candidate?.role ? candidate.role.charAt(0).toUpperCase() + candidate.role.slice(1) : "Not specified"}
                    </Badge>
                  </div>
                </div>

                {/* <div className="pt-4 space-y-2">
                  <Button onClick={() => onContact(candidate.email)} className="w-full" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Candidate
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </div> */}
              </CardContent>
            </Card>

            {/* Application Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Application Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Total and Pending */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total Applications</div>
                  </div>
                  <div className="text-center p-3 bg-card/75 border border-border/60 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>

                {/* Invited and In Progress */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/12 rounded-lg border border-primary/25">
                    <div className="text-2xl font-bold text-foreground">{stats.invited}</div>
                    <div className="text-xs text-muted-foreground">Invited</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/80 rounded-lg border border-border/60">
                    <div className="text-2xl font-bold text-secondary-foreground">{stats.inProgress}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                </div>

                {/* Completed and Interview Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-accent/15 rounded-lg border border-accent/30">
                    <div className="text-2xl font-bold text-accent-foreground">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-muted/55 rounded-lg border border-border/50">
                    <div className="text-2xl font-bold text-foreground">{interviewStats.totalInterviews}</div>
                    <div className="text-xs text-muted-foreground">Total Interviews</div>
                  </div>
                </div>

                {/* Accepted and Rejected (conditional) */}
                {(stats.accepted > 0 || stats.rejected > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {stats.accepted > 0 && (
                      <div className="text-center p-3 bg-primary/15 rounded-lg border border-primary/30">
                        <div className="text-2xl font-bold text-foreground">{stats.accepted}</div>
                        <div className="text-xs text-muted-foreground">Accepted</div>
                      </div>
                    )}
                    {stats.rejected > 0 && (
                      <div className="text-center p-3 bg-destructive/15 rounded-lg border border-destructive/30">
                        <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
                        <div className="text-xs text-muted-foreground">Rejected</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applied Job Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Categories Applied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {uniqueJobTitles.map((title, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {title}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Applications */}
          <div className="lg:col-span-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Application History ({candidate?.candidate_applications?.length || 0})
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{interviewStats.totalRounds} Interview Rounds</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {candidate?.candidate_applications?.length > 0 ? (
                  <div className="space-y-4">
                    {candidate?.candidate_applications?.map((application, index) => (
                      <ApplicationCard
                        key={index}
                        application={application}
                        onViewJob={onViewJob}
                        onViewRound={onViewRound}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
                    <p className="text-muted-foreground">This candidate hasn't applied to any jobs yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
