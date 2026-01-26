"use client";

import { useState, useMemo, useEffect } from "react";
import { MockInterviewCard } from "@/components/mock-interview-card";
import type { MockInterview } from "@/components/mock-interview-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Play, Clock, Target, Loader2 } from "lucide-react";
import { getMockInterviews } from "@/api/operations/mock-interview-api";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

// Sample data from your API response
// const mockInterviewsData: MockInterview[] = [
//   {
//     title: "Frontend Developer Mock Interview",
//     description:
//       "We are looking for an Experienced Software Developer to join our team",
//     id: "cmcujdiez0003uzajsu3ivnow",
//   },
//   {
//     title: "Full Stack Developer Mock Interview",
//     description:
//       "We are looking for an Experienced Software Developer to join our team",
//     id: "cmcuj8lpm0001uzajf5qoyov4",
//   },
// ];

export default function MockInterviewsListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [mockInterviewsData, setMockInterviewsData] = useState<MockInterview[]>(
    []
  );
  const [filteredInterviews, setFilteredInterviews] =
    useState<MockInterview[]>([]);

  const { token } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    const fetchMockInterviews = async () => {
      try {
        setIsLoading(true);
        const response = await getMockInterviews(token);

        if (response?.success) {
          setMockInterviewsData(response?.data);
          setFilteredInterviews(response?.data); // Add this line to initialize filtered interviews
          // toast.success(response?.message);
        } else {
          toast.error(response?.message);
        }
        setIsLoading(false);
      } catch (error) {
        toast.error("Error fetching mock interviews");
        setIsLoading(false);
      }
    };
    if (token) {
      fetchMockInterviews();
    }
  }, [token]);

  // Add this useEffect to automatically update filtered interviews when data changes
  useEffect(() => {
    if (mockInterviewsData.length > 0) {
      applyFilters(searchTerm, activeFilter);
    }
  }, [mockInterviewsData]);

  // Dynamic interview type extraction
  const getInterviewType = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("frontend") || titleLower.includes("front-end"))
      return "Frontend";
    if (titleLower.includes("backend") || titleLower.includes("back-end"))
      return "Backend";
    if (titleLower.includes("full stack") || titleLower.includes("fullstack"))
      return "Full Stack";
    if (
      titleLower.includes("data") &&
      (titleLower.includes("scientist") ||
        titleLower.includes("analyst") ||
        titleLower.includes("engineer"))
    )
      return "Data Science";
    if (
      titleLower.includes("mobile") ||
      titleLower.includes("android") ||
      titleLower.includes("ios")
    )
      return "Mobile";
    if (titleLower.includes("devops") || titleLower.includes("sre"))
      return "DevOps";
    if (titleLower.includes("qa") || titleLower.includes("test"))
      return "QA/Testing";
    if (titleLower.includes("ui") || titleLower.includes("ux")) return "UI/UX";
    if (titleLower.includes("product")) return "Product";
    if (titleLower.includes("security")) return "Security";
    return "General";
  };

  // Dynamic statistics calculation
  const stats = useMemo(() => {
    const total = mockInterviewsData.length;
    const typeCount: Record<string, number> = {};

    mockInterviewsData.forEach((interview) => {
      const type = getInterviewType(interview.title);
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return {
      total,
      typeCount,
      mostPopularType:
        Object.entries(typeCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "General",
      avgDuration: "20-25 min", // This could be dynamic if duration data is available
    };
  }, [mockInterviewsData]);

  // Dynamic interview types for filtering
  const interviewTypes = useMemo(() => {
    const types = mockInterviewsData.map((interview) =>
      getInterviewType(interview.title)
    );
    return [...new Set(types)].sort();
  }, [mockInterviewsData]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, activeFilter);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilters(searchTerm, filter);
  };

  const applyFilters = (searchTerm: string, filter: string) => {
    let filtered = mockInterviewsData;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((interview) => {
        const titleMatch = interview.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const descriptionMatch = interview.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return titleMatch || descriptionMatch;
      });
    }

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter((interview) => {
        const interviewType = getInterviewType(interview.title);
        return interviewType === filter;
      });
    }

    setFilteredInterviews(filtered);
  };

  const handleGiveMockInterview = (interviewId: string) => {
    console.log(`Starting mock interview: ${interviewId}`);
    router.push(`/mockinterview/${interviewId}`);
  };

  // Get top 3 types for stats display
  const topTypes = Object.entries(stats.typeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Play className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Mock Interviews</h1>
          </div>
          <p className="text-muted-foreground">
            Practice with realistic interview scenarios and get expert feedback
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dynamic Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Total Interviews</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          {topTypes.map(([type, count], index) => {
            const colors = [
              { icon: "text-blue-600", text: "text-blue-600" },
              { icon: "text-purple-600", text: "text-purple-600" },
              { icon: "text-green-600", text: "text-green-600" },
            ];
            const color = colors[index] || colors[0];

            return (
              <Card key={type}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Play className={`h-4 w-4 ${color.icon}`} />
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                  <p className={`text-2xl font-bold ${color.text}`}>{count}</p>
                </CardContent>
              </Card>
            );
          })}

          {topTypes.length < 3 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Avg Duration</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.avgDuration}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mock interviews by title or description..."
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

          {/* Dynamic Interview Type Filters */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Filter by Interview Type:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeFilter === "all" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange("all")}
              >
                All Interviews ({stats.total})
              </Badge>
              {interviewTypes.map((type) => {
                const count = stats.typeCount[type] || 0;
                return (
                  <Badge
                    key={type}
                    variant={activeFilter === type ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleFilterChange(type)}
                  >
                    {type} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredInterviews.length} of {mockInterviewsData.length}{" "}
            mock interviews
            {searchTerm && <span> for "{searchTerm}"</span>}
            {activeFilter !== "all" && <span> in {activeFilter}</span>}
          </p>
        </div>

        {/* Mock Interviews Grid */}
        {filteredInterviews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {filteredInterviews.map((interview) => (
              <MockInterviewCard
                key={interview.id}
                mockInterview={interview}
                onGiveMockInterview={handleGiveMockInterview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No mock interviews found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filter criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                handleSearch("");
                handleFilterChange("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Practice?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Mock interviews are a great way to prepare for real job interviews.
            Get personalized feedback, improve your skills, and boost your
            confidence.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Start Your First Mock Interview
            </Button>
            <Button variant="outline" size="lg">
              Learn More About Mock Interviews
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
