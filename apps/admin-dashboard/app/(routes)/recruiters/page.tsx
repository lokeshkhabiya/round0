"use client"

import { useEffect, useState } from "react"
import { RecruiterCard } from "@/components/recruiter-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Users, Building2, MapPin, Briefcase } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { getAllRecruiters } from "@/api/operations/recruiter-api"

export interface RecruiterProfile {
  company_name: string
  company_logo: string
  company_website: string
  company_description: string
  company_location: string
  company_size: number
  company_industry: string
}

export interface Recruiter {
  id: string
  name: string
  email: string
  role: string
  recruiter_profile: RecruiterProfile
}

export interface RecruitersResponse {
  success: boolean
  message: string
  data: Recruiter[]
}


export default function RecruitersListing() {
  const [searchTerm, setSearchTerm] = useState("")
  const [recruitersData, setRecruitersData] = useState<Recruiter[]>([])
  const [filteredRecruiters, setFilteredRecruiters] = useState(recruitersData)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchRecruiters = async () => {
      const response = await getAllRecruiters(token);
      if (response?.success) {
        setRecruitersData(response?.data);
      }
    }

    if (token) {
      fetchRecruiters();
    }
  }, [token])

  // Update filtered recruiters when recruitersData changes
  useEffect(() => {
    applyFilters(searchTerm, activeFilter);
  }, [recruitersData])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    applyFilters(term, activeFilter)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    applyFilters(searchTerm, filter)
  }

  const applyFilters = (searchTerm: string, filter: string) => {
    let filtered = recruitersData

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((recruiter) => {
        const nameMatch = recruiter.name.toLowerCase().includes(searchTerm.toLowerCase())
        const emailMatch = recruiter.email.toLowerCase().includes(searchTerm.toLowerCase())
        
        if (!recruiter.recruiter_profile) {
          return nameMatch || emailMatch
        }
        
        const companyMatch = (recruiter.recruiter_profile.company_name || "").toLowerCase().includes(searchTerm.toLowerCase())
        const industryMatch = (recruiter.recruiter_profile.company_industry || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
        const locationMatch = (recruiter.recruiter_profile.company_location || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        return nameMatch || emailMatch || companyMatch || industryMatch || locationMatch
      })
    }

    // Apply company size filter
    if (filter !== "all") {
      filtered = filtered.filter((recruiter) => {
        // Skip recruiters without profile
        if (!recruiter.recruiter_profile) {
          return false
        }
        
        const size = recruiter.recruiter_profile.company_size
        switch (filter) {
          case "startup":
            return size <= 10
          case "small":
            return size > 10 && size <= 50
          case "medium":
            return size > 50 && size <= 200
          case "large":
            return size > 200 && size <= 1000
          case "enterprise":
            return size > 1000
          default:
            return true
        }
      })
    }

    setFilteredRecruiters(filtered)
  }

  const handleViewProfile = (recruiterId: string) => {
    console.log(`Viewing recruiter profile: ${recruiterId}`)
    alert(`Opening recruiter profile for ID: ${recruiterId}`)
  }

  const handleViewCompany = (recruiterId: string) => {
    console.log(`Viewing company details: ${recruiterId}`)
    alert(`Opening company details for recruiter ID: ${recruiterId}`)
  }

  const getStats = () => {
    // Filter out recruiters without profiles for stats calculation
    const validRecruiters = recruitersData.filter(r => r.recruiter_profile)
    
    const totalRecruiters = recruitersData.length
    const uniqueCompanies = new Set(validRecruiters.map((r) => r.recruiter_profile.company_name)).size
    const uniqueIndustries = new Set(validRecruiters.map((r) => r.recruiter_profile.company_industry)).size
    const uniqueLocations = new Set(validRecruiters.map((r) => r.recruiter_profile.company_location)).size

    const companySizes = {
      startup: validRecruiters.filter((r) => r.recruiter_profile.company_size <= 10).length,
      small: validRecruiters.filter(
        (r) => r.recruiter_profile.company_size > 10 && r.recruiter_profile.company_size <= 50,
      ).length,
      medium: validRecruiters.filter(
        (r) => r.recruiter_profile.company_size > 50 && r.recruiter_profile.company_size <= 200,
      ).length,
      large: validRecruiters.filter(
        (r) => r.recruiter_profile.company_size > 200 && r.recruiter_profile.company_size <= 1000,
      ).length,
      enterprise: validRecruiters.filter((r) => r.recruiter_profile.company_size > 1000).length,
    }

    return { totalRecruiters, uniqueCompanies, uniqueIndustries, uniqueLocations, companySizes }
  }

  const stats = getStats()
  const uniqueIndustries = [...new Set(recruitersData.filter(r => r.recruiter_profile).map((r) => r.recruiter_profile.company_industry))]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Recruiters</h1>
          </div>
          <p className="text-muted-foreground">Connect with recruiters from top companies</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Total Recruiters</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalRecruiters}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Companies</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.uniqueCompanies}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Industries</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.uniqueIndustries}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Locations</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.uniqueLocations}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by recruiter name, company, industry, or location..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="default">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>

          {/* Company Size Filters */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Filter by Company Size:</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeFilter === "all" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("all")}
              >
                All Companies ({stats.totalRecruiters})
              </Badge>
              <Badge
                variant={activeFilter === "startup" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("startup")}
              >
                Startup (≤10) ({stats.companySizes.startup})
              </Badge>
              <Badge
                variant={activeFilter === "small" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("small")}
              >
                Small (11-50) ({stats.companySizes.small})
              </Badge>
              <Badge
                variant={activeFilter === "medium" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("medium")}
              >
                Medium (51-200) ({stats.companySizes.medium})
              </Badge>
              <Badge
                variant={activeFilter === "large" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("large")}
              >
                Large (201-1000) ({stats.companySizes.large})
              </Badge>
              <Badge
                variant={activeFilter === "enterprise" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("enterprise")}
              >
                Enterprise (1000+) ({stats.companySizes.enterprise})
              </Badge>
            </div>
          </div>

          {/* Industry Filter */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Industries:</p>
            <div className="flex flex-wrap gap-2">
              {uniqueIndustries.map((industry, index) => {
                const count = recruitersData.filter((r) => r.recruiter_profile?.company_industry === industry).length
                return (
                  <Badge key={index} variant="outline" className="text-xs">
                    {industry} ({count})
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredRecruiters.length} of {recruitersData.length} recruiters
            {searchTerm && <span> for "{searchTerm}"</span>}
          </p>
        </div>

        {/* Recruiters Grid */}
        {filteredRecruiters.length > 0 ? (
          <div className="flex flex-col gap-5">
            {filteredRecruiters.map((recruiter) => (
              <RecruiterCard
                key={recruiter.id}
                recruiter={recruiter}
                onViewProfile={handleViewProfile}
                onViewCompany={handleViewCompany}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recruiters found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search terms or filter criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                handleSearch("")
                handleFilterChange("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
