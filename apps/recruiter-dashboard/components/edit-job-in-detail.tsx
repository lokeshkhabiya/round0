"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    MapPin,
    Clock,
    Briefcase,
    Calendar,
    User,
    Mail,
    CheckCircle,
    Target,
    Users,
    Plus,
    X,
    Building,
    Save,
    Edit3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { updateJobPosting } from "@/api/operations/job-posting-api";

export interface JobDetail {
    id: string;
    title: string;
    description: string;
    jd_payload: {
        skills: string[];
        location: string;
        experience: string;
        requirements: string[];
        employment_type: string;
        responsibilities: string[];
    };
    recruiter: {
        name: string;
        email: string;
    };
    created_at: string;
}

export interface JobDetailResponse {
    success: boolean;
    message: string;
    data: JobDetail;
}

interface JobFormData {
    title: string;
    description: string;
    experience: string;
    skills: string[];
    requirements: string[];
    responsibilities: string[];
    location: string;
    employment_type: string;
}

interface JobDetailProps {
    job: JobDetail;
}

export default function EditJobInDetailComponent({ job }: JobDetailProps) {
    const router = useRouter();
    const { token } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSkill, setCurrentSkill] = useState("");
    const [currentRequirement, setCurrentRequirement] = useState("");
    const [currentResponsibility, setCurrentResponsibility] = useState("");

    const form = useForm<JobFormData>({
        defaultValues: {
            title: "",
            description: "",
            experience: "",
            skills: [],
            requirements: [],
            responsibilities: [],
            location: "",
            employment_type: "",
        },
    });

    // Update form when job data is available
    useEffect(() => {
        if (job) {
            form.reset({
                title: job.title || "",
                description: job.description || "",
                experience: job.jd_payload?.experience || "",
                skills: job.jd_payload?.skills || [],
                requirements: job.jd_payload?.requirements || [],
                responsibilities: job.jd_payload?.responsibilities || [],
                location: job.jd_payload?.location || "",
                employment_type: job.jd_payload?.employment_type || "",
            });
        }
    }, [job, form]);

    const experienceOptions = [
        "Entry Level (0-1 Years)",
        "1-2 Years",
        "2-3 Years",
        "3-5 Years",
        "5+ Years",
        "10+ Years",
    ];

    const locationOptions = ["Remote", "In Office", "Hybrid"];

    const employmentTypeOptions = [
        "Full-time",
        "Part-time",
        "Contract",
        "Freelance",
        "Internship",
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const addSkill = () => {
        if (
            currentSkill.trim() &&
            !form.getValues("skills").includes(currentSkill.trim())
        ) {
            const updatedSkills = [
                ...form.getValues("skills"),
                currentSkill.trim(),
            ];
            form.setValue("skills", updatedSkills);
            setCurrentSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        const updatedSkills = form
            .getValues("skills")
            .filter((skill) => skill !== skillToRemove);
        form.setValue("skills", updatedSkills);
    };

    const addRequirement = () => {
        if (
            currentRequirement.trim() &&
            !form.getValues("requirements").includes(currentRequirement.trim())
        ) {
            const updatedRequirements = [
                ...form.getValues("requirements"),
                currentRequirement.trim(),
            ];
            form.setValue("requirements", updatedRequirements);
            setCurrentRequirement("");
        }
    };

    const removeRequirement = (requirementToRemove: string) => {
        const updatedRequirements = form
            .getValues("requirements")
            .filter((req) => req !== requirementToRemove);
        form.setValue("requirements", updatedRequirements);
    };

    const addResponsibility = () => {
        if (
            currentResponsibility.trim() &&
            !form
                .getValues("responsibilities")
                .includes(currentResponsibility.trim())
        ) {
            const updatedResponsibilities = [
                ...form.getValues("responsibilities"),
                currentResponsibility.trim(),
            ];
            form.setValue("responsibilities", updatedResponsibilities);
            setCurrentResponsibility("");
        }
    };

    const removeResponsibility = (responsibilityToRemove: string) => {
        const updatedResponsibilities = form
            .getValues("responsibilities")
            .filter((resp) => resp !== responsibilityToRemove);
        form.setValue("responsibilities", updatedResponsibilities);
    };

    const onSubmit = async (data: JobFormData) => {
        setIsSubmitting(true);
        try {
            const jobData = {
                title: data.title,
                description: data.description,
                jd_payload: {
                    experience: data.experience,
                    skills: data.skills,
                    requirements: data.requirements,
                    responsibilities: data.responsibilities,
                    location: data.location,
                    employment_type: data.employment_type,
                },
            };

            const updateJob = async () => {
                const response = await updateJobPosting(job.id, jobData.title, jobData.description, jobData.jd_payload, token);
                if (response?.success) {
                    toast.success("Job updated successfully!");
                    setIsEditing(false);
                }
            }

            updateJob();
            router.push("/jobs"); 
        } catch (error) {
            console.error("Error updating job:", error);
            toast.error("Failed to update job. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original values
        if (job) {
            form.reset({
                title: job.title || "",
                description: job.description || "",
                experience: job.jd_payload?.experience || "",
                skills: job.jd_payload?.skills || [],
                requirements: job.jd_payload?.requirements || [],
                responsibilities: job.jd_payload?.responsibilities || [],
                location: job.jd_payload?.location || "",
                employment_type: job.jd_payload?.employment_type || "",
            });
        }
        setIsEditing(false);
        setCurrentSkill("");
        setCurrentRequirement("");
        setCurrentResponsibility("");
    };

    if (!isEditing) {
        // Display mode (original component)
        return (
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Header Section */}
                <Card>
                    <CardContent className="p-8">
                        <div className="flex items-start justify-between gap-8">
                            {/* Left side - Job Information */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <h1 className="text-3xl font-bold text-foreground">
                                            {job?.title}
                                        </h1>
                                        <Badge
                                            variant="secondary"
                                            className="text-sm px-3 py-1"
                                        >
                                            {job?.jd_payload.employment_type}
                                        </Badge>
                                    </div>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {job?.description}
                                    </p>
                                </div>

                                {/* Job Meta Information */}
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{job?.jd_payload.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            {job?.jd_payload.experience} experience
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            Posted on {formatDate(job?.created_at)}
                                        </span>
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
                                            <a
                                                href={`mailto:${job?.recruiter.email}`}
                                                className="text-primary hover:underline"
                                            >
                                                {job?.recruiter.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <div className="flex-shrink-0">
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2"
                                    size="lg"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    Edit Job
                                </Button>
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
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-sm px-3 py-1"
                                >
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
                                {job?.jd_payload.responsibilities.map(
                                    (responsibility, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-sm leading-relaxed">
                                                {responsibility}
                                            </span>
                                        </li>
                                    )
                                )}
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
                                {job?.jd_payload.requirements.map(
                                    (requirement, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-sm leading-relaxed">
                                                {requirement}
                                            </span>
                                        </li>
                                    )
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Edit mode (form)
    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Edit3 className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Edit Job</h1>
                        <p className="text-muted-foreground">
                            Update the job details below
                        </p>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                rules={{ required: "Job title is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Senior Frontend Developer"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                rules={{ required: "Job description is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Description</FormLabel>
                                        <FormControl>
                                            <textarea
                                                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Provide a detailed description of the job role..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                <FormField
                                    control={form.control}
                                    name="experience"
                                    rules={{ required: "Experience level is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Experience Level
                                            </FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    <option value="">Select experience level</option>
                                                    {experienceOptions.map((exp) => (
                                                        <option key={exp} value={exp}>
                                                            {exp}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    rules={{ required: "Location is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Location
                                            </FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    <option value="">Select location</option>
                                                    {locationOptions.map((loc) => (
                                                        <option key={loc} value={loc}>
                                                            {loc}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="employment_type"
                                    rules={{ required: "Employment type is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                Employment Type
                                            </FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    <option value="">Select employment type</option>
                                                    {employmentTypeOptions.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Required Skills
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a skill (e.g. React, TypeScript)"
                                    value={currentSkill}
                                    onChange={(e) => setCurrentSkill(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        (e.preventDefault(), addSkill())
                                    }
                                />
                                <Button type="button" onClick={addSkill} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {form.watch("skills").map((skill, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        {skill}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="p-0 w-4 h-4 hover:bg-transparent"
                                            onClick={() => removeSkill(skill)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
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
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a requirement"
                                    value={currentRequirement}
                                    onChange={(e) => setCurrentRequirement(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        (e.preventDefault(), addRequirement())
                                    }
                                />
                                <Button type="button" onClick={addRequirement} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {form.watch("requirements").map((requirement, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 p-2 bg-muted rounded-md"
                                    >
                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                        <span className="flex-1 text-sm">{requirement}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="p-1 w-6 h-6 hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() => removeRequirement(requirement)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Responsibilities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Key Responsibilities
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a responsibility"
                                    value={currentResponsibility}
                                    onChange={(e) => setCurrentResponsibility(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        (e.preventDefault(), addResponsibility())
                                    }
                                />
                                <Button type="button" onClick={addResponsibility} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {form.watch("responsibilities").map((responsibility, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 p-2 bg-muted rounded-md"
                                    >
                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                        <span className="flex-1 text-sm">{responsibility}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="p-1 w-6 h-6 hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() => removeResponsibility(responsibility)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <Card className="bg-muted/30">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Ready to Update?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Review your changes and save when ready.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSubmitting ? "Updating..." : "Update Job"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
