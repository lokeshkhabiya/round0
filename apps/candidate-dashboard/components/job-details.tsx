"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Briefcase, Calendar, User, Mail, CheckCircle, Target, Users } from "lucide-react"

export interface JobDetail {
    id: string
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
    recruiter: {
      name: string
      email: string
    }
    created_at: string
  }
  
  export interface JobDetailResponse {
    success: boolean
    message: string
    data: JobDetail
  }
  
interface JobDetailProps {
  job: JobDetail
  onApply: (jobId: string) => void
  applied: boolean
}

export function JobDetailComponent({ job, onApply, applied }: JobDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between gap-8">
            {/* Left side - Job Information */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-foreground">{job?.title}</h1>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {job?.jd_payload.employment_type}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{job?.description}</p>
              </div>

              {/* Job Meta Information */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job?.jd_payload.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{job?.jd_payload.experience} experience</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Posted on {formatDate(job?.created_at)}</span>
                </div>
              </div>

              {/* Recruiter Information */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Recruiter Information
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{job?.recruiter.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${job?.recruiter.email}`} className="text-primary hover:underline">
                      {job?.recruiter.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Apply Button */}
            <div className="flex-shrink-0">
              <div className="sticky top-6">
                {applied ? (
                  <Button size="lg" className="px-8 py-3 text-lg h-auto">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Applied
                  </Button>
                ) : (
                  <Button onClick={() => onApply(job?.id)} size="lg" className="px-8 py-3 text-lg h-auto">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Required Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {job?.jd_payload.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities and Requirements */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Key Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {job?.jd_payload.responsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{responsibility}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {job?.jd_payload.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Apply Section */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Ready to Apply?</h3>
              <p className="text-sm text-muted-foreground">
                Join our team and make an impact with your skills and experience.
              </p>
            </div>
            <Button onClick={() => onApply(job?.id)} size="lg" className="px-8">
              <Briefcase className="h-4 w-4 mr-2" />
              Apply for this Position
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
