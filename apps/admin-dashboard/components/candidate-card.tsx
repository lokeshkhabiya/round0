"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, FileText, Eye, MessageCircle } from "lucide-react"

export interface Candidate {
    id: string
    name: string
    email: string
    _count: {
      candidate_applications: number
    }
  }
  
  export interface CandidatesResponse {
    success: boolean
    message: string
    data: Candidate[]
  }
  
interface CandidateCardProps {
  candidate: Candidate
  onViewProfile: (candidateId: string) => void
  onContact: (candidateId: string, email: string) => void
}

export function CandidateCard({ candidate, onViewProfile, onContact }: CandidateCardProps) {
  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          {/* Left side - Candidate Information */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-4">
              {/* Avatar placeholder */}
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{candidate.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${candidate.email}`} className="hover:text-primary transition-colors">
                      {candidate.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {candidate._count.candidate_applications} Application
                      {candidate._count.candidate_applications !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <Badge
                    variant={candidate._count.candidate_applications > 3 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {candidate._count.candidate_applications > 5
                      ? "Highly Active"
                      : candidate._count.candidate_applications > 2
                        ? "Active"
                        : "New Candidate"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex-shrink-0 flex gap-3">
            {/* <Button
              variant="outline"
              size="default"
              onClick={() => onContact(candidate.id, candidate.email)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Contact
            </Button> */}

            <Button onClick={() => onViewProfile(candidate.id)} size="default" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
