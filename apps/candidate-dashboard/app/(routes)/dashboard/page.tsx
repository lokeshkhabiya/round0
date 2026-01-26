"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getCandidateProfile,
  createCandidateProfile,
  updateCandidateProfile,
  CandidateProfileData,
} from "@/api/operations/candidate-profile-api";
import { CandidateProfileForm } from "@/components/candidate-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Edit,
  Briefcase,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const DashboardPage = () => {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [profileData, setProfileData] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const checkProfile = async () => {
    if (!token) return;

    try {
      const response = await getCandidateProfile(token);

      if (response?.success && response?.data) {
        // Profile exists, show dashboard
        setProfileData(response.data);
        setShowForm(false);
        setIsEditMode(false);
      } else {
        // No profile found, show form for creation
        setShowForm(true);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      checkProfile();
    }
  }, [token]);

  const handleProfileSubmit = async (data: CandidateProfileData) => {
    setSubmitting(true);
    try {
      let response;
      
      if (isEditMode) {
        // Update existing profile
        response = await updateCandidateProfile(data, token as string);
      } else {
        // Create new profile
        response = await createCandidateProfile(data, token as string);
      }

      if (response?.success) {
        toast.success(isEditMode ? "Profile updated successfully!" : "Profile created successfully!");
        setProfileData(response.data);
        setShowForm(false);
        setIsEditMode(false);
      } else {
        toast.error(response?.message || `Failed to ${isEditMode ? 'update' : 'create'} profile`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} profile:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} profile`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <CandidateProfileForm
        initialData={profileData ?? undefined}
        onSubmit={handleProfileSubmit}
        isLoading={submitting}
        onCancel={handleCancelEdit}
        isEditMode={isEditMode}
      />
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Profile exists - show dashboard
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="border-b bg-white mb-4">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                Welcome back, {profileData?.name}!
              </h1>
            </div>
            <Button onClick={handleEditProfile}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
          <p className="text-muted-foreground">
            Your candidate dashboard - manage your profile and applications
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {profileData?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {profileData?.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {profileData?.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Links */}
                {(profileData?.linkedin_url ||
                  profileData?.github_url ||
                  profileData?.portfolio_url) && (
                  <div>
                    <h3 className="font-medium mb-3">Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData?.linkedin_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={profileData.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            LinkedIn <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {profileData?.github_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={profileData.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            GitHub <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {profileData?.portfolio_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={profileData.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Portfolio <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {profileData?.skills?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map(
                        (skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {profileData?.experience?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Work Experience</h3>
                    <div className="space-y-2">
                      {profileData.experience.map(
                        (exp: string, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-muted rounded-md text-sm"
                          >
                            {exp}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Education */}
                {profileData?.education?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Education</h3>
                    <div className="space-y-2">
                      {profileData.education.map(
                        (edu: string, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-muted rounded-md text-sm"
                          >
                            {edu}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {profileData?.certifications?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Certifications</h3>
                    <div className="space-y-2">
                      {profileData.certifications.map(
                        (cert: string, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-muted rounded-md text-sm"
                          >
                            {cert}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {profileData?.projects?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Projects</h3>
                    <div className="space-y-2">
                      {profileData.projects.map(
                        (project: string, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-muted rounded-md text-sm"
                          >
                            {project}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {profileData?.achievements?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Achievements</h3>
                    <div className="space-y-2">
                      {profileData.achievements.map(
                        (achievement: string, index: number) => (
                          <div
                            key={index}
                            className="p-3 bg-muted rounded-md text-sm"
                          >
                            {achievement}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {profileData?.interests?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map(
                        (interest: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                          >
                            {interest}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => router.push("/jobs")}
                >
                  Browse Jobs
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleEditProfile}
                >
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile Complete</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add more details to improve your profile visibility
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
