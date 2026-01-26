"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Users, Star } from "lucide-react"


export interface MockInterview {
    id: string
    title: string
    description: string
  }
  
  export interface MockInterviewsResponse {
    success: boolean
    message: string
    data: MockInterview[]
  }
  

interface MockInterviewCardProps {
  mockInterview: MockInterview
  onGiveMockInterview: (interviewId: string) => void
}

export function MockInterviewCard({ mockInterview, onGiveMockInterview }: MockInterviewCardProps) {
  const getInterviewType = (title: string) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes("frontend") || titleLower.includes("front-end")) return "Frontend"
    if (titleLower.includes("backend") || titleLower.includes("back-end")) return "Backend"
    if (titleLower.includes("full stack") || titleLower.includes("fullstack")) return "Full Stack"
    if (
      titleLower.includes("data") &&
      (titleLower.includes("scientist") || titleLower.includes("analyst") || titleLower.includes("engineer"))
    )
      return "Data Science"
    if (titleLower.includes("mobile") || titleLower.includes("android") || titleLower.includes("ios")) return "Mobile"
    if (titleLower.includes("devops") || titleLower.includes("sre")) return "DevOps"
    if (titleLower.includes("qa") || titleLower.includes("test")) return "QA/Testing"
    if (titleLower.includes("ui") || titleLower.includes("ux")) return "UI/UX"
    if (titleLower.includes("product")) return "Product"
    if (titleLower.includes("security")) return "Security"
    return "General"
  }

  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case "Frontend":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Backend":
        return "bg-green-100 text-green-800 border-green-200"
      case "Full Stack":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Data Science":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Mobile":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "DevOps":
        return "bg-red-100 text-red-800 border-red-200"
      case "QA/Testing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "UI/UX":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "Product":
        return "bg-teal-100 text-teal-800 border-teal-200"
      case "Security":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const interviewType = getInterviewType(mockInterview.title)

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{mockInterview.title}</CardTitle>
              <Badge className={`text-xs ${getInterviewTypeColor(interviewType)}`}>{interviewType}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{mockInterview.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Interview Features */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>25-30 min</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>1-on-1</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>Expert Level</span>
          </div>
        </div>

        {/* Interview Details */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold">What to Expect:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Technical coding questions</li>
            <li>• System design discussions</li>
            <li>• Behavioral interview questions</li>
            <li>• Real-time feedback and tips</li>
          </ul>
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">Interview ID: {mockInterview.id}</div>
          <Button
            onClick={() => onGiveMockInterview(mockInterview.id)}
            size="default"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 cursor-pointer"
          >
            <Play className="h-4 w-4" />
            Give Mock Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
