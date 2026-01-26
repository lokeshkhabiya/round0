"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AttemptCard } from "./attempt-card"
import DetailedReportModal from "./detailed-report-modal"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Target,
  Users,
  Play,
  TrendingUp,
  Calendar,
  CheckCircle,
} from "lucide-react"
import type { MockInterviewDetailData } from "./attempt-card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getReport, startMockInterview } from "@/api/operations/mock-interview-api"
import { useAuthStore } from "@/stores/auth-store"
import { useInterviewTokenPayloadStore } from "@/stores/interview-token-payload-store"
import { useState } from "react"

export default function MockInterviewDetail({ mockInterviewDetailData }: { mockInterviewDetailData: MockInterviewDetailData }) {
  const { token } = useAuthStore(); 
  const { setToken, setInterviewTokenPayload } = useInterviewTokenPayloadStore(); 
  const { mock_job, attempts } = mockInterviewDetailData
  const router = useRouter()
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const handleBack = () => {
    router.push("/mockinterview")
  }

  const handleStartNewInterview = async() => {
    try {
      const response = await startMockInterview(token, mock_job.id)
      if (response?.success) {
        setToken(response.interview_token)
        setInterviewTokenPayload(response.interview_token_payload)
        window.open(response.redirect_url, '_blank')
        toast.success("Mock interview started successfully!")
      } else {
        toast.error(response?.message)
      }
    } catch (error) {
      console.log("error while starting new mock interview", error)
    }
  }

  const handleViewAttemptDetails = async(attemptId: string) => {
    try {
      setReportLoading(true)
      setIsModalOpen(true)
      const response = await getReport(token, attemptId);
      if (response?.success) {
        setReportData(response.report)
      } else {
        toast.error(response?.message || "Failed to fetch report")
        setIsModalOpen(false)
      }
    } catch (error) {
      console.log("error while getting mock interview attempt details", error)
      toast.error("Error while getting mock interview attempt details")
      setIsModalOpen(false)
    } finally {
      setReportLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getOverallStats = () => {
    const totalAttempts = attempts.length
    const completedAttempts = attempts.filter((attempt) => attempt.status === "completed").length
    const inProgressAttempts = attempts.filter((attempt) => attempt.status === "in_progress").length

    const allScores = attempts.flatMap((attempt) =>
      attempt.interview_session.flatMap((session) => session.interview_round.map((round) => round.zero_score)),
    )

    const averageScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0
    const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0

    return {
      totalAttempts,
      completedAttempts,
      inProgressAttempts,
      averageScore,
      bestScore,
    }
  }

  const stats = getOverallStats()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={handleBack} className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Mock Interviews
            </Button>
          </div>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{mock_job.title}</h1>
                <Badge variant="secondary" className="text-sm">
                  Mock Interview
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-4">{mock_job.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{mock_job.jd_payload.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{mock_job.jd_payload.experience} experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{mock_job.jd_payload.employment_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(mock_job.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button onClick={handleStartNewInterview} size="lg" className="flex items-center gap-2 cursor-pointer">
                <Play className="h-5 w-5" />
                Start New Interview
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.totalAttempts}</div>
                    <div className="text-xs text-muted-foreground">Total Attempts</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.bestScore}%</div>
                    <div className="text-xs text-muted-foreground">Best Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.averageScore}%</div>
                    <div className="text-xs text-muted-foreground">Average Score</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.inProgressAttempts}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Required Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Required Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mock_job.jd_payload.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Key Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mock_job.jd_payload.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Interview Attempts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Interview Attempts ({attempts.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {attempts.length > 0 ? (
                  <div className="space-y-6">
                    {attempts.map((attempt, index) => (
                      <AttemptCard
                        key={attempt.id}
                        attempt={attempt}
                        attemptNumber={attempts.length - index}
                        onViewDetails={handleViewAttemptDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Attempts Yet</h3>
                    <p className="text-muted-foreground mb-4">Start your first mock interview to begin practicing.</p>
                    <Button onClick={handleStartNewInterview} className="flex items-center gap-2 cursor-pointer">
                      <Play className="h-4 w-4" />
                      Start First Interview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Detailed Report Modal */}
      <DetailedReportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setReportData(null)
        }}
        reportData={reportData}
        loading={reportLoading}
      />
    </div>
  )
}
