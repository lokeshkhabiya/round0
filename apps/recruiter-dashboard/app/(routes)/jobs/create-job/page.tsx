"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Briefcase,
	Plus,
	X,
	MapPin,
	Clock,
	Building,
	Users,
	Bot,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createJobPosting } from "@/api/operations/job-posting-api";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { generateJD } from "@/api/operations/generate-api";

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

const CreateJobPage = () => {
	const router = useRouter();
	const [currentSkill, setCurrentSkill] = useState("");
	const [currentRequirement, setCurrentRequirement] = useState("");
	const [currentResponsibility, setCurrentResponsibility] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [AItitle, SetAiTitle] = useState("");
	const [AIdescription, SetAiDescription] = useState("");
	const [loading , setLoading]= useState(false);
	const [open,SetOpen] = useState(false);
	const { token } = useAuthStore();

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

	const addSkill = () => {
		if (
			currentSkill.trim() &&
			!form.getValues("skills").includes(currentSkill.trim())
		) {
			const updatedSkills = [...form.getValues("skills"), currentSkill.trim()];
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
			!form.getValues("responsibilities").includes(currentResponsibility.trim())
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

			const postTheJob = async () => {
				const response = await createJobPosting(
					jobData.title,
					jobData.description,
					jobData.jd_payload,
					token
				);
				if (response?.success) {
					toast.success(response?.message);
					router.push("/jobs");
				} else {
					toast.error(response?.message);
				}
			};

			postTheJob();
			router.push("/jobs");
		} catch (error) {
			console.error("Error creating job:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleAIGeneratingJD = async () => {
		try {
			setLoading(true);
			const response = await generateJD(AItitle, AIdescription);
			
			// Parse the JSON response
			const jobData = JSON.parse(response);
			
			// Populate the basic form fields
			form.setValue("title", jobData.title);
			form.setValue("description", jobData.description);
			form.setValue("experience", jobData.jd_payload.experience);
			form.setValue("location", jobData.jd_payload.location);
			form.setValue("employment_type", jobData.jd_payload.employment_type);
			
			// Populate the arrays
			form.setValue("skills", jobData.jd_payload.skills);
			form.setValue("requirements", jobData.jd_payload.requirements);
			form.setValue("responsibilities", jobData.jd_payload.responsibilities);
			setLoading(false);
			SetOpen(false);
			toast.success("Job description generated successfully!");
			
		} catch (error) {
			console.error("Error parsing AI response:", error);
			toast.error("Failed to generate job description. Please try again.");
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b bg-white flex">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-3 mb-4">
						<Briefcase className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold">Create New Job</h1>
					</div>
					<p className="text-muted-foreground">
						Fill out the details below to create a new job posting.
					</p>
				</div>

				<div className="top-10 right-10 absolute">
					<Dialog open={open} onOpenChange={SetOpen}>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								size="default"
								className="disabled:cursor-not-allowed cursor-pointer"
								onClick={() => SetOpen(true)}
							>
								<Bot className="h-6 w-6 mr-2" /> Generate With AI
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									Generate Job Description with AI
								</DialogTitle>
								<DialogDescription>
									Enter a job title and description to generate a complete job posting with AI.
								</DialogDescription>
								<label>Job Title</label>
								<Input
									placeholder="e.g. Senior Frontend Developer"
									value={AItitle}
									onChange={(e) => SetAiTitle(e.target.value)}
								/>
								<label>Description</label>
								<textarea
									className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Prompt with the essential data for generating job description"
									value={AIdescription}
									onChange={(e) => SetAiDescription(e.target.value)}
								/>
								<div className="flex gap-2 mt-5">
									<Button 
										variant="outline" 
										onClick={() => SetOpen(false)}
										disabled={loading}
									>
										Cancel
									</Button>
									<Button 
										onClick={handleAIGeneratingJD}
										disabled={loading || !AItitle.trim() || !AIdescription.trim()}
									>
										{loading ? "Generating..." : "Generate"}
									</Button>
								</div>
							</DialogHeader>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8 max-w-5xl">
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
									rules={{
										required: "Job title is required",
									}}
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
									rules={{
										required: "Job description is required",
									}}
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
										rules={{
											required: "Experience level is required",
										}}
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
										rules={{
											required: "Location is required",
										}}
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
										rules={{
											required: "Employment type is required",
										}}
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
								<CardTitle>Required Skills</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex gap-2">
									<Input
										placeholder="Add a skill (e.g. React, TypeScript)"
										value={currentSkill}
										onChange={(e) => setCurrentSkill(e.target.value)}
										onKeyPress={(e) =>
											e.key === "Enter" && (e.preventDefault(), addSkill())
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
								<CardTitle>Requirements</CardTitle>
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
								<CardTitle>Key Responsibilities</CardTitle>
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
									{form
										.watch("responsibilities")
										.map((responsibility, index) => (
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
									<h3 className="text-lg font-semibold mb-1">Ready to Post?</h3>
									<p className="text-sm text-muted-foreground">
										Review your job posting and submit when ready.
									</p>
								</div>
								<div className="flex gap-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => router.push("/jobs")}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting}
										className="bg-green-500 hover:bg-green-600"
									>
										{isSubmitting ? "Creating..." : "Create Job"}
									</Button>
								</div>
							</CardContent>
						</Card>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default CreateJobPage;
