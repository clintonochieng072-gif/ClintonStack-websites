"use client";

import React, { useState, useEffect } from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Search,
  UserCheck,
  Home,
  Building,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { getAuthHeaders } from "@/lib/utils";

interface ManualPayment {
  _id: string;
  userId: string;
  planType: "monthly" | "lifetime";
  planName: string;
  planAmount: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface Affiliate {
  _id: string;
  name: string;
  email: string;
  referralCode: string;
  totalEarned: number;
  availableBalance: number;
  clientsReferred: number;
  status: "active" | "inactive";
  createdAt: string;
}

export default function RealEstateDashboard() {
  const { user } = useGlobalContext();
  const [pendingPayments, setPendingPayments] = useState<ManualPayment[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingAffiliates, setLoadingAffiliates] = useState(false);
  const [approvingPayment, setApprovingPayment] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = user?.email === "clintonochieng072@gmail.com";

  useEffect(() => {
    if (isAdmin) {
      fetchPendingPayments();
      fetchAffiliates();
    }
  }, [isAdmin]);

  const fetchPendingPayments = async () => {
    setLoadingPayments(true);
    try {
      const response = await fetch("/api/admin/payments", {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.manualPayments) {
          // Filter only pending payments
          const pending = data.data.manualPayments.filter(
            (payment: any) => payment.status === "pending"
          );
          setPendingPayments(pending);
        }
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchAffiliates = async () => {
    setLoadingAffiliates(true);
    try {
      const response = await fetch("/api/admin/affiliate", {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAffiliates(data.affiliates || []);
        }
      }
    } catch (error) {
      console.error("Error fetching affiliates:", error);
    } finally {
      setLoadingAffiliates(false);
    }
  };

  const approvePaymentByEmail = async () => {
    if (!userEmail.trim()) {
      alert("Please enter a user email");
      return;
    }

    setApprovingPayment(userEmail);
    try {
      const response = await fetch("/api/admin/approve-payment", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve payment");
      }

      const result = await response.json();
      alert("Payment approved successfully!");
      setUserEmail("");
      fetchPendingPayments(); // Refresh the list
      fetchAffiliates(); // Refresh affiliate data if needed
      // Refresh user data
      window.location.reload();
    } catch (error: any) {
      console.error("Error approving payment:", error);
      alert(error.message || "Failed to approve payment");
    } finally {
      setApprovingPayment(null);
    }
  };

  const filteredAffiliates = affiliates.filter(
    (affiliate) =>
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Admin-Only Payment Approval Section */}
        {isAdmin && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <CheckCircle className="w-5 h-5" />
                Manual Payment Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Approve manual payments by entering the user's email address.
                </p>

                <div className="flex gap-4 max-w-md">
                  <Input
                    type="email"
                    placeholder="Enter user email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={approvingPayment !== null}
                  />
                  <Button
                    onClick={approvePaymentByEmail}
                    disabled={!userEmail.trim() || approvingPayment !== null}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approvingPayment === userEmail
                      ? "Approving..."
                      : "Approve Payment"}
                  </Button>
                </div>

                {pendingPayments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">
                      Pending Payments ({pendingPayments.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {pendingPayments.slice(0, 5).map((payment) => (
                        <div
                          key={payment._id}
                          className="flex justify-between items-center p-2 bg-white rounded border"
                        >
                          <div>
                            <span className="font-medium">
                              {payment.fullName}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({payment.email})
                            </span>
                          </div>
                          <div className="text-sm">
                            KES {payment.planAmount.toLocaleString()} -{" "}
                            {payment.planType}
                          </div>
                        </div>
                      ))}
                      {pendingPayments.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          And {pendingPayments.length - 5} more...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to your Real Estate Dashboard
          </h1>
        </div>

        {/* Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="affiliates"
                className="flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Affiliate Records
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Home className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Properties
                      </p>
                      <p className="text-2xl font-bold text-gray-900">24</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <MapPin className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Active Listings
                      </p>
                      <p className="text-2xl font-bold text-gray-900">18</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Leads
                      </p>
                      <p className="text-2xl font-bold text-gray-900">156</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        KES 2.4M
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Your Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Property Management
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Manage your real estate listings and properties
                  </p>
                  <Button>Add New Property</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Real Estate Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Performance Analytics
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Track your property performance and market insights
                  </p>
                  <Button>View Analytics</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin-Only Affiliate Records Tab */}
          {isAdmin && (
            <TabsContent value="affiliates">
              <div className="space-y-6">
                {/* Affiliate Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <UserCheck className="w-8 h-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Total Affiliates
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {affiliates.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Total Referrals
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {affiliates.reduce(
                              (sum, aff) => sum + aff.clientsReferred,
                              0
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <DollarSign className="w-8 h-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Total Earnings
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            KES{" "}
                            {affiliates
                              .reduce((sum, aff) => sum + aff.totalEarned, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Search */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search by name, email, or referral code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Affiliates List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Affiliate Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingAffiliates ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : filteredAffiliates.length === 0 ? (
                      <div className="text-center py-12">
                        <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No affiliates found
                        </h3>
                        <p className="text-gray-600">
                          {searchTerm
                            ? "Try adjusting your search terms."
                            : "No affiliates have been registered yet."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAffiliates.map((affiliate) => (
                          <div
                            key={affiliate._id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge
                                  className={
                                    affiliate.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {affiliate.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Joined{" "}
                                  {new Date(
                                    affiliate.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {affiliate.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {affiliate.email}
                                  </p>
                                  <p className="text-sm text-gray-500 font-mono">
                                    {affiliate.referralCode}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    Clients Referred
                                  </h4>
                                  <p className="text-2xl font-bold text-blue-600">
                                    {affiliate.clientsReferred}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    Earnings
                                  </h4>
                                  <p className="text-xl font-bold text-green-600">
                                    KES {affiliate.totalEarned.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Available: KES{" "}
                                    {affiliate.availableBalance.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
