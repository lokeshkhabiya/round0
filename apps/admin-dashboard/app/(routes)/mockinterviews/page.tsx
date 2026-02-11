"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getAllMockInterviews } from "@/api/operations/mockinterview-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  ClipboardList,
  Code,
  Paintbrush,
  Briefcase,
  BarChart3,
  Users,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface MockInterview {
  id: string;
  title: string;
  description: string;
  jd_payload: {
    experience?: string;
    skills?: string[];
    role_category?: string;
    difficulty_level?: string;
    interview_tools?: string[];
    [key: string]: unknown;
  };
  created_at?: string;
  _count?: {
    candidate_applications: number;
  };
}

const roleCategoryLabels: Record<string, string> = {
  engineering: "Engineering",
  data_analytics: "Data & Analytics",
  business: "Business",
  other: "Other",
};

const difficultyLabels: Record<string, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior Level",
  expert: "Expert Level",
};

const difficultyColors: Record<string, string> = {
  entry: "bg-primary/15 text-foreground border-primary/35",
  mid: "bg-secondary/85 text-secondary-foreground border-border/70",
  senior: "bg-accent/20 text-accent-foreground border-accent/35",
  expert: "bg-destructive/20 text-destructive border-destructive/35",
};

const roleCategoryIcons: Record<string, React.ReactNode> = {
  engineering: <Code className="h-4 w-4" />,
  data_analytics: <BarChart3 className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
  other: <ClipboardList className="h-4 w-4" />,
};

const toolLabels: Record<string, string> = {
  code_editor: "Code Editor",
  whiteboard: "Whiteboard",
  file_upload: "File Upload",
};

export default function MockInterviewsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [mockInterviews, setMockInterviews] = useState<MockInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  useEffect(() => {
    const fetchMockInterviews = async () => {
      try {
        setLoading(true);
        const response = await getAllMockInterviews(token);
        if (response?.success) {
          setMockInterviews(response.data || []);
        } else {
          toast.error(response?.message || "Failed to fetch mock interviews");
        }
      } catch (error) {
        console.error("Error fetching mock interviews:", error);
        toast.error("Failed to fetch mock interviews");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMockInterviews();
    }
  }, [token]);

  const filteredInterviews = mockInterviews.filter((interview) => {
    const matchesSearch =
      interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      filterRole === "all" ||
      interview.jd_payload?.role_category === filterRole;
    const matchesDifficulty =
      filterDifficulty === "all" ||
      interview.jd_payload?.difficulty_level === filterDifficulty;
    return matchesSearch && matchesRole && matchesDifficulty;
  });

  const stats = {
    total: mockInterviews.length,
    engineering: mockInterviews.filter(
      (i) => i.jd_payload?.role_category === "engineering"
    ).length,
    data_analytics: mockInterviews.filter(
      (i) => i.jd_payload?.role_category === "data_analytics"
    ).length,
    business: mockInterviews.filter(
      (i) => i.jd_payload?.role_category === "business"
    ).length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/55 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ClipboardList className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Mock Interviews</h1>
              </div>
              <p className="text-muted-foreground">
                Create and manage mock interview templates for candidates
              </p>
            </div>
            <Button
              onClick={() => router.push("/mockinterviews/create")}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Mock Interview
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Code className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.engineering}</p>
                  <p className="text-sm text-muted-foreground">Engineering</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{stats.data_analytics}</p>
                  <p className="text-sm text-muted-foreground">
                    Data & Analytics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.business}</p>
                  <p className="text-sm text-muted-foreground">Business</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mock interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="engineering">Engineering</option>
                <option value="data_analytics">Data & Analytics</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="expert">Expert Level</option>
            </select>
          </div>
        </div>

        {/* Mock Interviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Mock Interviews Found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterRole !== "all" || filterDifficulty !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first mock interview to get started"}
              </p>
              {!searchQuery && filterRole === "all" && filterDifficulty === "all" && (
                <Button onClick={() => router.push("/mockinterviews/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mock Interview
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInterviews.map((interview) => (
              <Card
                key={interview.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() =>
                  router.push(`/mockinterviews/edit/${interview.id}`)
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {interview.title}
                    </CardTitle>
                    <div className="flex-shrink-0 ml-2">
                      {roleCategoryIcons[
                        interview.jd_payload?.role_category || "other"
                      ] || <ClipboardList className="h-4 w-4" />}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interview.jd_payload?.role_category && (
                      <Badge variant="outline" className="text-xs">
                        {roleCategoryLabels[
                          interview.jd_payload.role_category
                        ] || interview.jd_payload.role_category}
                      </Badge>
                    )}
                    {interview.jd_payload?.difficulty_level && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          difficultyColors[
                            interview.jd_payload.difficulty_level
                          ] || ""
                        }`}
                      >
                        {difficultyLabels[
                          interview.jd_payload.difficulty_level
                        ] || interview.jd_payload.difficulty_level}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {interview.description}
                  </p>

                  {/* Tools */}
                  {interview.jd_payload?.interview_tools &&
                    interview.jd_payload.interview_tools.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {interview.jd_payload.interview_tools.map((tool) => (
                          <Badge
                            key={tool}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tool === "code_editor" && (
                              <Code className="h-3 w-3 mr-1" />
                            )}
                            {tool === "whiteboard" && (
                              <Paintbrush className="h-3 w-3 mr-1" />
                            )}
                            {toolLabels[tool] || tool}
                          </Badge>
                        ))}
                      </div>
                    )}

                  {/* Skills */}
                  {interview.jd_payload?.skills &&
                    interview.jd_payload.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {interview.jd_payload.skills.slice(0, 4).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {interview.jd_payload.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{interview.jd_payload.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                  {/* Candidates Count */}
                  {interview._count && (
                    <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>
                        {interview._count.candidate_applications} attempts
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
