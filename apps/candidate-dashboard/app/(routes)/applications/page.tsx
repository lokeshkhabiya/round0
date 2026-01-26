"use client"

import { useEffect, useState } from "react"
import { MyApplicationCard } from "@/components/my-application-card"
import type { Application } from "@/components/my-application-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, FileText, Clock, CheckCircle, Eye, AlertCircle, XCircle } from "lucide-react"
import { getAllApplications } from "@/api/operations/job-application-api"
import { useAuthStore } from "@/stores/auth-store"


export default function MyApplications() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [applicationsData, setApplicationsData] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        const response = await getAllApplications(token)
        if(response?.success){
          setApplicationsData(response.data)
          setFilteredApplications(response.data)
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if(mounted && token){
        fetchApplications()
    }
  }, [token, mounted])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    applyFilters(term, activeFilter)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    applyFilters(searchTerm, filter)
  }

  const applyFilters = (searchTerm: string, filter: string) => {
    let filtered = applicationsData

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((application) => {
        const titleMatch = application.job_description.title.toLowerCase().includes(searchTerm.toLowerCase())
        const descriptionMatch = application.job_description.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
        return titleMatch || descriptionMatch
      })
    }

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((application) => application.status === filter)
    }

    setFilteredApplications(filtered)
  }

  const handleViewJob = (jobId: string) => {
    console.log(`Viewing job: ${jobId}`)
    alert(`Opening job details for ID: ${jobId}`)
  }

  const handleViewApplication = (applicationId: string) => {
    console.log(`Viewing application: ${applicationId}`)
    alert(`Opening application details for ID: ${applicationId}`)
  }

  const getStats = () => {
    const total = applicationsData.length
    const pending = applicationsData.filter((app) => app.status === "pending").length
    const invited = applicationsData.filter((app) => app.status === "invited").length
    const inProgress = applicationsData.filter((app) => app.status === "in_progress").length
    const completed = applicationsData.filter((app) => app.status === "completed").length
    const accepted = applicationsData.filter((app) => app.status === "accepted").length
    const rejected = applicationsData.filter((app) => app.status === "rejected").length

    return { total, pending, invited, inProgress, completed, accepted, rejected }
  }

  const stats = getStats()
  const uniqueStatuses = [...new Set(applicationsData.map((app) => app.status))]

  // Don't render the main content until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">My Applications</h1>
            </div>
            <p className="text-muted-foreground">Track the status of your job applications</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your applications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Applications</h1>
          </div>
          <p className="text-muted-foreground">Track the status of your job applications</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Invited</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.invited}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Accepted</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications by job title or description..."
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

          {/* Status Filters */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Filter by Status:</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeFilter === "all" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("all")}
              >
                All Applications ({stats.total})
              </Badge>
              {uniqueStatuses.map((status) => {
                const count = applicationsData.filter((app) => app.status === status).length
                return (
                  <Badge
                    key={status}
                    variant={activeFilter === status ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleFilterChange(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")} ({count})
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredApplications.length} of {applicationsData.length} applications
            {searchTerm && <span> for "{searchTerm}"</span>}
          </p>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <MyApplicationCard
                key={application.id}
                application={application}
                onViewJob={handleViewJob}
                onViewApplication={handleViewApplication}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
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
