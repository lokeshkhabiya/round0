"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
import { Search, Filter, Briefcase, Users } from "lucide-react";
import { JobCard } from "./job-card";
import { useRouter } from "next/navigation";
import { getAllJobs } from "@/api/operations/job-fetching-api";
import { useAuthStore } from "@/stores/auth-store";

export interface JobPosting {
    id: string
    title: string
    description: string
    recruiter: {
      name: string
    }
  }
  
  export interface JobListingsResponse {
    success: boolean
    message: string
    data: JobPosting[]
  }
  

export default function JobListings() {
    const [searchTerm, setSearchTerm] = useState("")
    const [jobData, setJobData] = useState<JobPosting[]>([]);
    const [filteredJobs, setFilteredJobs] = useState(jobData)
    const { token } = useAuthStore();

    const router = useRouter();

    const fetchJobs = async () => {
          const response = await getAllJobs(token as string);
          if(!response?.success){
            console.log(response?.message);
            return;
          }
          setJobData(response?.data);
          setFilteredJobs(response?.data);
    }

	useEffect(() => {
    if(token){
        fetchJobs();
    }
	}, [token]);
  
    const handleSearch = (term: string) => {
      setSearchTerm(term)
      if (term.trim() === "") {
        setFilteredJobs(jobData)
      } else {
        const filtered = jobData.filter((job) => {
          const titleMatch = job.title.toLowerCase().includes(term.toLowerCase())
          const descriptionMatch = job.description.toLowerCase().includes(term.toLowerCase())
          const recruiterMatch = job.recruiter.name.toLowerCase().includes(term.toLowerCase())
  
          return titleMatch || descriptionMatch || recruiterMatch
        })
        setFilteredJobs(filtered)
      }
    }
  
    const handleApply = (jobId: string) => {
      // Handle job application logic here
    //   console.log(`Applying for job: ${jobId}`)
      router.push(`/jobs/${jobId}`)
    }
  
    const getUniqueRecruiters = () => {
      const recruiters = jobData.map((job) => job.recruiter.name)
      return [...new Set(recruiters)]
    }
  
    const filterByRecruiter = (recruiterName: string) => {
      const filtered = jobData.filter((job) => job.recruiter.name === recruiterName)
      setFilteredJobs(filtered)
      setSearchTerm(`Recruiter: ${recruiterName}`)
    }
  
    const uniqueRecruiters = getUniqueRecruiters()
  
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">ZeroCV</h1>
            </div>
            <p className="text-muted-foreground">Discover your next career opportunity from our curated job listings</p>
          </div>
        </div>
  
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, description, or recruiter..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* <Button variant="outline" size="default">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button> */}
            </div>
  
            {/* Filter by Recruiters */}
            {/* <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Filter by Recruiter:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    setFilteredJobs(jobData)
                    setSearchTerm("")
                  }}
                >
                  All Jobs ({jobData.length})
                </Badge>
                {uniqueRecruiters.map((recruiter, index) => {
                  const jobCount = jobData.filter((job) => job.recruiter.name === recruiter).length
                  return (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => filterByRecruiter(recruiter)}
                    >
                      {recruiter} ({jobCount})
                    </Badge>
                  )
                })}
              </div>
            </div> */}
          </div>
  
          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredJobs.length} of {jobData.length} jobs
              {searchTerm && !searchTerm.startsWith("Recruiter:") && <span> for "{searchTerm}"</span>}
            </p>
            {filteredJobs.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {filteredJobs.length} position{filteredJobs.length !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
  
          {/* Job Cards List */}
          {filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} onViewJob={handleApply} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or browse all available positions.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  handleSearch("")
                  setFilteredJobs(jobData)
                }}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }