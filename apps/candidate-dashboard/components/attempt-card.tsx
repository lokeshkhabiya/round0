"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApplicationStatusBadge } from "./application-status-badge"
import { Calendar, Eye, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const handleDiscussWithMentor = () => {
    const interviewSessionId = attempt.interview_session[0]?.id
    if (interviewSessionId) {
      router.push(`/mentor?interview_session_id=${interviewSessionId}`)
    }
  }
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
    if (score >= 80) return "text-primary"
    if (score >= 60) return "text-foreground"
    if (score >= 40) return "text-accent"
    return "text-destructive"
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
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Attempt #{attemptNumber}</h4>
            <ApplicationStatusBadge status={attempt.status} />
            {averageScore > 0 && (
              <Badge variant="outline" className="text-[10px]">{averageScore}%</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(attempt.created_at)}</span>
            </div>
            <span>{totalRounds} round{totalRounds !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Interview Rounds */}
        <div className="space-y-2 mb-3">
          {attempt.interview_session.map((session) => (
            <div key={session.id} className="space-y-2">
              {session.interview_round.map((round) => (
                <div key={round.id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        R{round.round_number}: {round.round_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    </div>
                    <span className={`text-xs font-medium ${getScoreColor(round.zero_score)}`}>
                      {round.zero_score}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{round.ai_summary}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(attempt.interview_session[0].interview_round[0].id)}
            className="text-xs h-7"
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
          {attempt.status === "completed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscussWithMentor}
              className="text-xs h-7"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Discuss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
