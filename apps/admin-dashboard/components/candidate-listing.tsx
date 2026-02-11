"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Users, TrendingUp, UserCheck } from "lucide-react"
import { Candidate, CandidateCard } from "./candidate-card"
import { getAllCandidates } from "@/api/operations/candidate-api"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"


export default function CandidatesListing() {
  const [searchTerm, setSearchTerm] = useState("")
  const [candidatesData,setCandidatesData] = useState<Candidate[]>();
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const { token } = useAuthStore();
  const router = useRouter();


  const fetchCandidates = async () =>{
    const response = await getAllCandidates(token as string)

    if(!response?.success){
      console.log(response?.message);
      return;
    }

    if(response?.success){
      // toast.success(response?.message);
      setCandidatesData(response?.data);
    }
  }

  useEffect(()=>{
    if(token){
      fetchCandidates()
    }
  },[token])


  useEffect(()=>{
    if(candidatesData){
      applyFilters(searchTerm,activeFilter);
    }
  },[candidatesData])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    applyFilters(term, activeFilter)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    applyFilters(searchTerm, filter)
  }

  const applyFilters = (searchTerm: string, filter: string) => {
    let filtered = candidatesData

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered?.filter((candidate) => {
        const nameMatch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
        const emailMatch = candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
        return nameMatch || emailMatch
      })
    }

    // Apply activity filter
    if (filter !== "all") {
      filtered = filtered?.filter((candidate) => {
        switch (filter) {
          case "highly-active":
            return candidate._count.candidate_applications > 5
          case "active":
            return candidate._count.candidate_applications > 2 && candidate._count.candidate_applications <= 5
          case "new":
            return candidate._count.candidate_applications <= 2
          default:
            return true
        }
      })
    }

    setFilteredCandidates(filtered!)
  }

  const handleViewProfile = (candidateId: string) => {
    console.log(`Viewing profile for candidate: ${candidateId}`)
    router.push(`/candidates/${candidateId}`)
  }

  const handleContact = (candidateId: string, email: string) => {
    console.log(`Contacting candidate: ${candidateId}`)
    // Open email client
    window.location.href = `mailto:${email}?subject=Regarding Your Job Application`
  }

  const getStats = () => {
    const totalApplications = candidatesData?.reduce(
      (sum, candidate) => sum + candidate._count.candidate_applications,
      0,
    )
    const highlyActive = candidatesData?.filter((c) => c._count.candidate_applications > 5).length
    const active = candidatesData?.filter(
      (c) => c._count.candidate_applications > 2 && c._count.candidate_applications <= 5,
    ).length
    const newCandidates = candidatesData?.filter((c) => c._count.candidate_applications <= 2).length

    return { totalApplications, highlyActive, active, newCandidates }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/55 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Candidates</h1>
          </div>
          <p className="text-muted-foreground">Manage and review candidate applications</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card/76 p-4 rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Candidates</span>
            </div>
            <p className="text-2xl font-bold">{candidatesData?.length}</p>
          </div>

          <div className="bg-card/76 p-4 rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Total Applications</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalApplications}</p>
          </div>

          <div className="bg-card/76 p-4 rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Highly Active</span>
            </div>
            <p className="text-2xl font-bold">{stats.highlyActive}</p>
          </div>

          <div className="bg-card/76 p-4 rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">New Candidates</span>
            </div>
            <p className="text-2xl font-bold">{stats.newCandidates}</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name or email..."
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

          {/* Activity Level Filters */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Filter by Activity Level:</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeFilter === "all" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("all")}
              >
                All Candidates ({candidatesData?.length})
              </Badge>
              <Badge
                variant={activeFilter === "highly-active" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("highly-active")}
              >
                Highly Active ({stats.highlyActive})
              </Badge>
              <Badge
                variant={activeFilter === "active" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("active")}
              >
                Active ({stats.active})
              </Badge>
              <Badge
                variant={activeFilter === "new" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("new")}
              >
                New Candidates ({stats.newCandidates})
              </Badge>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredCandidates?.length} of {candidatesData?.length} candidates
            {searchTerm && <span> for "{searchTerm}"</span>}
          </p>
        </div>

        {/* Candidate Cards List */}
        {filteredCandidates?.length > 0 ? (
          <div className="space-y-4">
            {filteredCandidates?.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onViewProfile={handleViewProfile}
                onContact={handleContact}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
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
