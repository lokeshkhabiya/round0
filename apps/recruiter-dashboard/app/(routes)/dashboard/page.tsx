"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  getRecruiterProfile,
  createRecruiterProfile,
  updateRecruiterProfile,
  RecruiterProfileData,
} from "@/api/operations/recruiter-profile-api";
import { RecruiterProfileForm } from "@/components/recruiter-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Edit,
  Briefcase,
  Target,
  ExternalLink,
  Image,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const DashboardPage = () => {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [profileData, setProfileData] = useState<RecruiterProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const checkProfile = async () => {
    if (!token) return;

    try {
      const response = await getRecruiterProfile(token);

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

  const handleProfileSubmit = async (data: RecruiterProfileData) => {
    setSubmitting(true);
    try {
      let response;
      
      if (isEditMode) {
        // Update existing profile
        response = await updateRecruiterProfile(data, token as string);
      } else {
        // Create new profile
        response = await createRecruiterProfile(data, token as string);
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

  const getCompanySizeLabel = (size: number | null | undefined) => {
    if (!size) return "Not specified";
    if (size <= 10) return "1-10 employees";
    if (size <= 50) return "11-50 employees";
    if (size <= 200) return "51-200 employees";
    if (size <= 500) return "201-500 employees";
    if (size <= 1000) return "501-1000 employees";
    return "1000+ employees";
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
      <RecruiterProfileForm
        initialData={profileData || undefined}
        onSubmit={handleProfileSubmit}
        isLoading={submitting}
        onCancel={handleCancelEdit}
        isEditMode={isEditMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                {profileData?.company_logo ? (
                  <img
                    src={profileData.company_logo}
                    alt={profileData.company_name}
                    className="w-12 h-12 object-contain rounded"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profileData?.company_name}</h1>
                <p className="text-muted-foreground">Company Profile</p>
              </div>
            </div>
            <Button onClick={handleEditProfile} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Company Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData?.company_industry && (
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Industry</p>
                      <Badge variant="secondary" className="mt-1">
                        {profileData.company_industry}
                      </Badge>
                    </div>
                  </div>
                )}

                {profileData?.company_location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{profileData.company_location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Company Size</p>
                    <p className="text-sm text-muted-foreground">
                      {getCompanySizeLabel(profileData?.company_size)}
                    </p>
                  </div>
                </div>

                {profileData?.company_website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a
                        href={profileData.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {profileData.company_website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push("/jobs/create-job")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create New Job
                </Button>
                <Button
                  onClick={() => router.push("/jobs")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  View All Jobs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Company Description */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  About {profileData?.company_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData?.company_description ? (
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {profileData.company_description}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Company Description</h3>
                    <p className="text-muted-foreground mb-4">
                      Add a description to help candidates learn more about your company.
                    </p>
                    <Button onClick={handleEditProfile} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Add Description
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
