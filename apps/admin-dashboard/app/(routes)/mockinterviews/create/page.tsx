"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Plus,
  X,
  Clock,
  Building,
  Users,
  Bot,
  Code,
  Paintbrush,
  Upload,
  BarChart3,
  Briefcase,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createMockJobPosting } from "@/api/operations/mockinterview-api";
import { generateMockInterviewJD } from "@/api/operations/generate-api";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const experienceOptions = [
  "Entry Level (0-1 Years)",
  "1-2 Years",
  "2-3 Years",
  "3-5 Years",
  "5+ Years",
  "10+ Years",
];

const roleCategoryOptions = [
  { value: "engineering", label: "Engineering", icon: Code },
  { value: "data_analytics", label: "Data & Analytics", icon: BarChart3 },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "other", label: "Other", icon: ClipboardList },
];

const difficultyOptions = [
  { value: "entry", label: "Entry Level", description: "Junior positions, basic questions" },
  { value: "mid", label: "Mid Level", description: "Intermediate positions, moderate complexity" },
  { value: "senior", label: "Senior Level", description: "Senior positions, advanced scenarios" },
  { value: "expert", label: "Expert Level", description: "Staff/Principal positions, complex system design" },
];

const toolOptions = [
  { value: "code_editor", label: "Code Editor", icon: Code, description: "Monaco editor for writing and running code" },
  { value: "whiteboard", label: "Whiteboard", icon: Paintbrush, description: "Excalidraw canvas for system design" },
  { value: "file_upload", label: "File Upload", icon: Upload, description: "Upload documents and presentations" },
];

const defaultToolsByRole: Record<string, string[]> = {
  engineering: ["code_editor", "whiteboard"],
  data_analytics: ["code_editor", "whiteboard"],
  business: ["whiteboard", "file_upload"],
  other: ["whiteboard", "file_upload"],
};

export default function CreateMockInterviewPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [roleCategory, setRoleCategory] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [interviewTools, setInterviewTools] = useState<string[]>([]);
  const [location, setLocation] = useState("Remote");
  const [employmentType, setEmploymentType] = useState("Full-time");

  // Dynamic lists
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [currentRequirement, setCurrentRequirement] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [currentResponsibility, setCurrentResponsibility] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiTitle, setAiTitle] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const handleRoleCategoryChange = (value: string) => {
    setRoleCategory(value);
    setInterviewTools(defaultToolsByRole[value] || []);
  };

  const toggleTool = (tool: string) => {
    setInterviewTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addRequirement = () => {
    if (currentRequirement.trim() && !requirements.includes(currentRequirement.trim())) {
      setRequirements([...requirements, currentRequirement.trim()]);
      setCurrentRequirement("");
    }
  };

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter((r) => r !== req));
  };

  const addResponsibility = () => {
    if (currentResponsibility.trim() && !responsibilities.includes(currentResponsibility.trim())) {
      setResponsibilities([...responsibilities, currentResponsibility.trim()]);
      setCurrentResponsibility("");
    }
  };

  const removeResponsibility = (resp: string) => {
    setResponsibilities(responsibilities.filter((r) => r !== resp));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!roleCategory) {
      toast.error("Role category is required");
      return;
    }
    if (!difficultyLevel) {
      toast.error("Difficulty level is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const jd_payload = {
        experience,
        skills,
        requirements,
        responsibilities,
        location,
        employment_type: employmentType,
        role_category: roleCategory,
        difficulty_level: difficultyLevel,
        interview_tools: interviewTools,
      };

      const response = await createMockJobPosting(
        title,
        description,
        jd_payload,
        token
      );

      if (response?.success) {
        toast.success(response.message || "Mock interview created successfully!");
        router.push("/mockinterviews");
      } else {
        toast.error(response?.message || "Failed to create mock interview");
      }
    } catch (error) {
      console.error("Error creating mock interview:", error);
      toast.error("Failed to create mock interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiTitle.trim() || !aiDescription.trim()) {
      toast.error("Provide both title and description for AI generation");
      return;
    }

    try {
      setAiLoading(true);
      const response = await generateMockInterviewJD(aiTitle, aiDescription);
      const jobData = JSON.parse(response);

      setTitle(jobData.title);
      setDescription(jobData.description);
      setExperience(jobData.jd_payload.experience || "");
      setLocation(jobData.jd_payload.location || "Remote");
      setEmploymentType(jobData.jd_payload.employment_type || "Full-time");
      setSkills(jobData.jd_payload.skills || []);
      setRequirements(jobData.jd_payload.requirements || []);
      setResponsibilities(jobData.jd_payload.responsibilities || []);

      if (jobData.jd_payload.role_category) {
        setRoleCategory(jobData.jd_payload.role_category);
        setInterviewTools(
          jobData.jd_payload.interview_tools ||
          defaultToolsByRole[jobData.jd_payload.role_category] ||
          []
        );
      }
      if (jobData.jd_payload.difficulty_level) {
        setDifficultyLevel(jobData.jd_payload.difficulty_level);
      }

      setAiDialogOpen(false);
      toast.success("Mock interview description generated successfully!");
    } catch (error) {
      console.error("Error generating AI description:", error);
      toast.error("Failed to generate description. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/55 bg-background/70 backdrop-blur-xl flex">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Create Mock Interview</h1>
          </div>
          <p className="text-muted-foreground">
            Configure a mock interview template for candidates to practice with
          </p>
        </div>

        <div className="absolute top-10 right-10">
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setAiDialogOpen(true)}
              >
                <Bot className="h-5 w-5 mr-2" /> Generate With AI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Mock Interview with AI</DialogTitle>
                <DialogDescription>
                  Enter a role title and brief description to auto-generate a complete mock interview configuration.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Role Title</label>
                  <Input
                    placeholder="e.g. Senior Full Stack Developer"
                    value={aiTitle}
                    onChange={(e) => setAiTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                    placeholder="Describe what this mock interview should cover..."
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setAiDialogOpen(false)}
                    disabled={aiLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAIGenerate}
                    disabled={aiLoading || !aiTitle.trim() || !aiDescription.trim()}
                  >
                    {aiLoading ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="e.g. Senior Frontend Developer Mock Interview"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                  placeholder="Provide a detailed description of the mock interview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Role Category & Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Interview Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Category */}
              <div>
                <label className="text-sm font-medium mb-3 block">Role Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {roleCategoryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRoleCategoryChange(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        roleCategory === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-ring/50"
                      }`}
                    >
                      <option.icon
                        className={`h-6 w-6 mb-2 ${
                          roleCategory === option.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <p className="font-medium text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="text-sm font-medium mb-3 block">Difficulty Level *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficultyLevel(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        difficultyLevel === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-ring/50"
                      }`}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Tools */}
              <div>
                <label className="text-sm font-medium mb-3 block">Interview Tools</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {toolOptions.map((tool) => (
                    <button
                      key={tool.value}
                      type="button"
                      onClick={() => toggleTool(tool.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left flex items-start gap-3 ${
                        interviewTools.includes(tool.value)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-ring/50"
                      }`}
                    >
                      <tool.icon
                        className={`h-5 w-5 mt-0.5 ${
                          interviewTools.includes(tool.value)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">{tool.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Experience Level
                  </label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="">Select experience level</option>
                    {experienceOptions.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    <option value="Remote">Remote</option>
                    <option value="In Office">In Office</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Employment Type</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g. React, TypeScript)"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addSkill} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={() => removeSkill(skill)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a requirement"
                  value={currentRequirement}
                  onChange={(e) => setCurrentRequirement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                />
                <Button type="button" onClick={addRequirement} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="flex-1 text-sm">{requirement}</span>
                    <button
                      type="button"
                      className="p-1 hover:text-destructive"
                      onClick={() => removeRequirement(requirement)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Key Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a responsibility"
                  value={currentResponsibility}
                  onChange={(e) => setCurrentResponsibility(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addResponsibility();
                    }
                  }}
                />
                <Button type="button" onClick={addResponsibility} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="flex-1 text-sm">{responsibility}</span>
                    <button
                      type="button"
                      className="p-1 hover:text-destructive"
                      onClick={() => removeResponsibility(responsibility)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <Card className="bg-muted/30">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Ready to Create?</h3>
                <p className="text-sm text-muted-foreground">
                  Review your mock interview configuration and submit when ready.
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/mockinterviews")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? "Creating..." : "Create Mock Interview"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
