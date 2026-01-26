"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Users, Globe, Mail, Eye, MessageCircle, ExternalLink } from "lucide-react"
import { Recruiter } from "@/app/(routes)/recruiters/page"


interface RecruiterCardProps {
  recruiter: Recruiter
  onViewProfile: (recruiterId: string) => void
  onViewCompany: (recruiterId: string) => void
}

export function RecruiterCard({ recruiter, onViewProfile, onViewCompany }: RecruiterCardProps) {
  const getCompanySizeLabel = (size: number) => {
    if (size <= 10) return "Startup"
    if (size <= 50) return "Small"
    if (size <= 200) return "Medium"
    if (size <= 1000) return "Large"
    return "Enterprise"
  }

  const getCompanySizeColor = (size: number) => {
    if (size <= 10) return "bg-purple-100 text-purple-800"
    if (size <= 50) return "bg-blue-100 text-blue-800"
    if (size <= 200) return "bg-green-100 text-green-800"
    if (size <= 1000) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  const formatWebsiteUrl = (website: string) => {
    if (!website) return ""
    return website.startsWith("http") ? website : `https://${website}`
  }

  // If recruiter profile doesn't exist, show basic info
  if (!recruiter.recruiter_profile) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Recruiter Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl mb-1 truncate">Company Profile Not Available</CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">
                    Recruiter: <span className="font-medium text-foreground">{recruiter.name}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Company Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a
                href={`mailto:${recruiter.email}`}
                className="text-primary hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {recruiter.email}
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewCompany(recruiter.id)}
              className="flex items-center gap-2"
              disabled
            >
              <Building2 className="h-4 w-4" />
              Company Details
            </Button>

            <Button size="sm" onClick={() => onViewProfile(recruiter.id)} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {recruiter.recruiter_profile.company_logo ? (
              <img
                src={recruiter.recruiter_profile.company_logo || "/placeholder.svg"}
                alt={`${recruiter.recruiter_profile.company_name || 'Company'} logo`}
                className="w-16 h-16 object-contain rounded-lg border bg-white p-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.nextElementSibling?.classList.remove("hidden")
                }}
              />
            ) : null}
            <div
              className={`w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center ${
                recruiter.recruiter_profile.company_logo ? "hidden" : ""
              }`}
            >
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Company & Recruiter Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-1 truncate">{recruiter.recruiter_profile.company_name || 'Unknown Company'}</CardTitle>
                <p className="text-sm text-muted-foreground mb-2">
                  Recruiter: <span className="font-medium text-foreground">{recruiter.name}</span>
                </p>
                <div className="flex items-center gap-2 mb-3">
                  {recruiter.recruiter_profile.company_industry && (
                    <Badge variant="outline" className="text-xs">
                      {recruiter.recruiter_profile.company_industry}
                    </Badge>
                  )}
                  {recruiter.recruiter_profile.company_size && (
                    <Badge className={`text-xs ${getCompanySizeColor(recruiter.recruiter_profile.company_size)}`}>
                      {getCompanySizeLabel(recruiter.recruiter_profile.company_size)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {recruiter.recruiter_profile.company_description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {recruiter.recruiter_profile.company_description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {recruiter.recruiter_profile.company_location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{recruiter.recruiter_profile.company_location}</span>
            </div>
          )}

          {recruiter.recruiter_profile.company_size && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{recruiter.recruiter_profile.company_size}+ employees</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a
              href={`mailto:${recruiter.email}`}
              className="text-primary hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {recruiter.email}
            </a>
          </div>

          {recruiter.recruiter_profile.company_website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a
                href={formatWebsiteUrl(recruiter.recruiter_profile.company_website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {recruiter.recruiter_profile.company_website}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewCompany(recruiter.id)}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Company Details
          </Button>

          <Button size="sm" onClick={() => onViewProfile(recruiter.id)} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
