"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Mail,
  Phone,
  Image,
  FileText,
  Building,
  Hash,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { RecruiterProfileData } from "@/api/operations/recruiter-profile-api";

interface RecruiterProfileFormProps {
  initialData?: RecruiterProfileData;
  onSubmit: (data: RecruiterProfileData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
  isEditMode?: boolean;
}

export function RecruiterProfileForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  isEditMode = false,
}: RecruiterProfileFormProps) {
  const [formData, setFormData] = useState<RecruiterProfileData>({
    company_name: initialData?.company_name || "",
    company_logo: initialData?.company_logo || "",
    company_website: initialData?.company_website || "",
    company_description: initialData?.company_description || "",
    company_location: initialData?.company_location || "",
    company_size: initialData?.company_size || undefined,
    company_industry: initialData?.company_industry || "",
  });

  const handleInputChange = (
    field: keyof RecruiterProfileData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.company_name.trim()) {
      toast.error("Company name is required");
      return;
    }

    onSubmit(formData);
  };

  const companySizeOptions = [
    { value: "", label: "Select company size" },
    { value: "1", label: "1-10 employees" },
    { value: "11", label: "11-50 employees" },
    { value: "51", label: "51-200 employees" },
    { value: "201", label: "201-500 employees" },
    { value: "501", label: "501-1000 employees" },
    { value: "1001", label: "1000+ employees" },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="border-b bg-white mb-4">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Company Profile" : "Complete Company Profile"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isEditMode 
              ? "Update your company information to keep it current." 
              : "Help candidates learn more about your company by completing your profile information."
            }
          </p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company Name *
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange("company_name", e.target.value)}
                    placeholder="Enter your company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_industry" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Industry
                  </Label>
                  <Input
                    id="company_industry"
                    value={formData.company_industry}
                    onChange={(e) => handleInputChange("company_industry", e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Company Location
                  </Label>
                  <Input
                    id="company_location"
                    value={formData.company_location}
                    onChange={(e) => handleInputChange("company_location", e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_size" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Company Size
                  </Label>
                  <select
                    id="company_size"
                    value={formData.company_size || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        company_size: value ? parseInt(value) : undefined,
                      }));
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {companySizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Company Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_description">
                  About Your Company
                </Label>
                <textarea
                  id="company_description"
                  value={formData.company_description}
                  onChange={(e) => handleInputChange("company_description", e.target.value)}
                  placeholder="Describe your company, mission, values, and what makes it unique..."
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Online Presence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Online Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="company_website"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Company Website
                  </Label>
                  <Input
                    id="company_website"
                    value={formData.company_website}
                    onChange={(e) =>
                      handleInputChange("company_website", e.target.value)
                    }
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="company_logo"
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Company Logo URL
                  </Label>
                  <Input
                    id="company_logo"
                    value={formData.company_logo}
                    onChange={(e) =>
                      handleInputChange("company_logo", e.target.value)
                    }
                    placeholder="https://link-to-your-logo.png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            {isEditMode && onCancel && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onCancel}
                disabled={isLoading}
                className="min-w-32"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="min-w-32"
            >
              {isLoading 
                ? "Saving..." 
                : isEditMode 
                  ? "Update Profile" 
                  : "Save Profile"
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 