"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, DollarSign, TrendingUp, Eye } from "lucide-react";
import { getAuthHeaders } from "@/lib/utils";

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

export default function AdminAffiliatePage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const response = await fetch("/api/admin/affiliate", {
        headers: getAuthHeaders(),
      });

      if (response.status === 403) {
        alert("Access denied. Admin privileges required.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch affiliates");
      }

      const data = await response.json();
      setAffiliates(data.affiliates || []);
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      alert("Failed to load affiliates");
    } finally {
      setLoading(false);
    }
  };

  const filteredAffiliates = affiliates.filter(
    (affiliate) =>
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading affiliates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Affiliate Management
          </h1>
          <p className="text-gray-600">
            Track affiliate performance and referral statistics.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
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
                <TrendingUp className="w-8 h-8 text-green-600" />
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
        <Card className="mb-6">
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
        <div className="space-y-4">
          {filteredAffiliates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No affiliates found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "Try adjusting your search terms."
                      : "No affiliates have been registered yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAffiliates.map((affiliate) => (
              <Card
                key={affiliate._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(affiliate.status)}>
                          {affiliate.status.charAt(0).toUpperCase() +
                            affiliate.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Joined{" "}
                          {new Date(affiliate.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                            Total Earned
                          </h4>
                          <p className="text-2xl font-bold text-green-600">
                            KES {affiliate.totalEarned.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900">
                            Available Balance
                          </h4>
                          <p className="text-2xl font-bold text-yellow-600">
                            KES {affiliate.availableBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Could add view details functionality
                          alert(
                            `Affiliate: ${affiliate.name}\nReferral Code: ${affiliate.referralCode}`
                          );
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
