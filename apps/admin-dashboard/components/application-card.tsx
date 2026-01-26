"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Users, Calendar } from "lucide-react"
import type { CandidateApplication } from "./candidate-profile"
import { ApplicationStatusBadge } from "./application-status-badge"


interface ApplicationCardProps {
  application: CandidateApplication
  onViewJob: (jobId: string) => void
  onViewRound: (roundId: string, roundNumber: number, roundType: string) => void
}

export function ApplicationCard({ application, onViewJob, onViewRound }: ApplicationCardProps) {
  const hasInterviewSessions = application.interview_session && application.interview_session.length > 0
  const interviewRounds = hasInterviewSessions ? application.interview_session[0].interview_round : []

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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{application.job_description.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{application.job_description.description}</p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Interview Rounds Section */}
        {hasInterviewSessions && interviewRounds.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4" />
              Interview Rounds ({interviewRounds.length})
            </div>

            <div className="space-y-2">
              {interviewRounds.map((round) => (
                <div key={round.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Round {round.round_number}</span>
                    </div>
                    <Badge className={`text-xs ${getRoundTypeColor(round.round_type || "unknown")}`}>
                      {round.round_type ? round.round_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Unknown Type"}
                    </Badge>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewRound(round.id, round.round_number, round.round_type)}
                    className={`text-xs ${round.status == "completed" ? "" : "opacity-50 cursor-not-allowed"}`}
                  >
                    View Round {round.round_number}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Actions */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-xs text-muted-foreground">Job ID: {application.job_description.id}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewJob(application.job_description.id)}
            className="flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            View Job
          </Button>
        </div>
      </CardContent>
    </Card>


  )
}
