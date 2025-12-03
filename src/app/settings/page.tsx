"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Save,
  User,
  Globe,
  Shield,
  CreditCard,
  Settings as SettingsIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [profileData, setProfileData] = useState({
    name: "Clinton",
    email: "clinton@example.com",
    avatar: "",
  });

  const [websiteData, setWebsiteData] = useState({
    title: "My Website",
    description: "Welcome to my professional website",
    niche: "Freelancer",
    seoTitle: "",
    seoDescription: "",
  });

  const [domainData, setDomainData] = useState({
    customDomain: "",
    subdomain: "clinton.clintonstack.com",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = () => {
    // TODO: Implement save
    console.log("Saving profile:", profileData);
  };

  const handleSaveWebsite = () => {
    // TODO: Implement save
    console.log("Saving website:", websiteData);
  };

  const handleSaveDomain = () => {
    // TODO: Implement save
    console.log("Saving domain:", domainData);
  };

  const handleSaveSecurity = () => {
    // TODO: Implement save
    console.log("Saving security:", securityData);
  };

  const FormField = ({
    label,
    children,
    className = "",
  }: {
    label: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 items-center ${className}`}
    >
      <label className="text-sm font-medium text-gray-700 md:text-right">
        {label}
      </label>
      <div className="md:col-span-2">{children}</div>
    </div>
  );

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </TabsTrigger>
            <TabsTrigger value="domain" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Domain
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* General Profile Tab */}
          <TabsContent value="profile">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>General Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField label="Avatar">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={profileData.avatar}
                        alt={profileData.name}
                      />
                      <AvatarFallback>
                        {profileData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                  </div>
                </FormField>

                <FormField label="Name">
                  <Input
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder="Your full name"
                  />
                </FormField>

                <FormField label="Email">
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                </FormField>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Website Info Tab */}
          <TabsContent value="website">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Website Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField label="Site Title">
                  <Input
                    value={websiteData.title}
                    onChange={(e) =>
                      setWebsiteData({ ...websiteData, title: e.target.value })
                    }
                    placeholder="Your website title"
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    value={websiteData.description}
                    onChange={(e) =>
                      setWebsiteData({
                        ...websiteData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of your website"
                    rows={3}
                  />
                </FormField>

                <FormField label="Niche">
                  <select
                    value={websiteData.niche}
                    onChange={(e) =>
                      setWebsiteData({ ...websiteData, niche: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Freelancer">Freelancer</option>
                    <option value="Business">Business</option>
                    <option value="Creative">Creative</option>
                    <option value="Services">Services</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </FormField>

                <FormField label="SEO Title">
                  <Input
                    value={websiteData.seoTitle}
                    onChange={(e) =>
                      setWebsiteData({
                        ...websiteData,
                        seoTitle: e.target.value,
                      })
                    }
                    placeholder="SEO optimized title"
                  />
                </FormField>

                <FormField label="SEO Description">
                  <Textarea
                    value={websiteData.seoDescription}
                    onChange={(e) =>
                      setWebsiteData({
                        ...websiteData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="SEO meta description"
                    rows={3}
                  />
                </FormField>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={handleSaveWebsite}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domain Setup Tab */}
          <TabsContent value="domain">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Domain Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField label="Subdomain">
                  <div className="flex items-center">
                    <Input
                      value={domainData.subdomain}
                      readOnly
                      className="bg-gray-50"
                    />
                    <span className="ml-2 text-sm text-gray-500">Free</span>
                  </div>
                </FormField>

                <FormField label="Custom Domain">
                  <div className="space-y-2">
                    <Input
                      value={domainData.customDomain}
                      onChange={(e) =>
                        setDomainData({
                          ...domainData,
                          customDomain: e.target.value,
                        })
                      }
                      placeholder="yourdomain.com"
                    />
                    <p className="text-sm text-gray-500">
                      Connect your own domain (Premium feature)
                    </p>
                  </div>
                </FormField>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={handleSaveDomain}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Billing Management
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Manage your subscription and payment methods
                  </p>
                  <Button>Manage Billing</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField label="Current Password">
                  <Input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                  />
                </FormField>

                <FormField label="New Password">
                  <Input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                  />
                </FormField>

                <FormField label="Confirm Password">
                  <Input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      setSecurityData({
                        ...securityData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                  />
                </FormField>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={handleSaveSecurity}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
