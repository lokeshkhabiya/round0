"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApplicationStatusBadge } from "./application-status-badge"
import { Calendar, Target, TrendingUp, Eye } from "lucide-react"

export interface MockJobDetail {
  id: string
  recruiter_id: string
  title: string
  description: string
  jd_payload: {
    skills: string[]
    location: string
    experience: string
    requirements: string[]
    employment_type: string
    responsibilities: string[]
  }
  is_mock: boolean
  created_at: string
  updated_at: string
}

export interface InterviewRound {
  id: string
  zero_score: number
  ai_summary: string
  round_number: number
  round_type: string
}

export interface InterviewSession {
  id: string
  interview_round: InterviewRound[]
}

export interface MockInterviewAttempt {
  id: string
  job_description_id: string
  created_at: string
  status: string
  interview_session: InterviewSession[]
}

export interface MockInterviewDetailData {
  mock_job: MockJobDetail
  attempts: MockInterviewAttempt[]
}

export interface MockInterviewDetailResponse {
  success: boolean
  message: string
  data: MockInterviewDetailData
}


interface AttemptCardProps {
  attempt: MockInterviewAttempt
  attemptNumber: number
  onViewDetails: (attemptId: string) => void
}

export function AttemptCard({ attempt, attemptNumber, onViewDetails }: AttemptCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getRoundTypeColor = (roundType: string) => {
    switch (roundType.toLowerCase()) {
      case "skill_assessment":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "behavioural":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "technical":
        return "bg-green-50 text-green-700 border-green-200"
      case "hr":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const totalRounds = attempt.interview_session.reduce((total, session) => total + session.interview_round.length, 0)
  const averageScore =
    totalRounds > 0
      ? Math.round(
          attempt.interview_session.reduce(
            (total, session) =>
              total + session.interview_round.reduce((roundTotal, round) => roundTotal + round.zero_score, 0),
            0,
          ) / totalRounds,
        )
      : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg">Attempt #{attemptNumber}</CardTitle>
              <ApplicationStatusBadge status={attempt.status} />
              {averageScore > 0 && (
                <Badge className={`text-xs ${getScoreBadgeColor(averageScore)}`}>Score: {averageScore}%</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(attempt.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>
                  {totalRounds} Round{totalRounds !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Interview Rounds */}
        {attempt.interview_session.map((session, sessionIndex) => (
          <div key={session.id} className="space-y-3">
            {session.interview_round.map((round, roundIndex) => (
              <div key={round.id} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs ${getRoundTypeColor(round.round_type)}`}>
                      Round {round.round_number}:{" "}
                      {round.round_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-4 w-4 ${getScoreColor(round.zero_score)}`} />
                      <span className={`text-sm font-semibold ${getScoreColor(round.zero_score)}`}>
                        {round.zero_score}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">AI Feedback:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{round.ai_summary}</p>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(attempt.interview_session[0].interview_round[0].id)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
