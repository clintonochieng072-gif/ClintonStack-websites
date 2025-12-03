"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Receipt,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import SubscriptionDashboard from "@/components/SubscriptionDashboard";

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  description: string;
  invoiceUrl?: string;
}

interface PaymentMethod {
  id: string;
  type: "card" | "mpesa";
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "methods"
  >("overview");
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setBillingHistory([
        {
          id: "1",
          date: "2024-12-01",
          amount: 1999,
          status: "paid",
          description: "Standard Plan - December 2024",
          invoiceUrl: "#",
        },
        {
          id: "2",
          date: "2024-11-01",
          amount: 1999,
          status: "paid",
          description: "Standard Plan - November 2024",
          invoiceUrl: "#",
        },
      ]);

      setPaymentMethods([
        {
          id: "1",
          type: "mpesa",
          last4: "1234",
          isDefault: true,
        },
      ]);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: CreditCard },
    { id: "history", label: "Billing History", icon: Receipt },
    { id: "methods", label: "Payment Methods", icon: Calendar },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4" />;
      case "failed":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Billing & Subscription
          </h1>
          <p className="text-gray-600">
            Manage your subscription, view billing history, and update payment
            methods.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <SubscriptionDashboard />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => router.push("/pricing")}
                  >
                    <CreditCard className="w-6 h-6" />
                    Change Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab("methods")}
                  >
                    <Calendar className="w-6 h-6" />
                    Update Payment
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab("history")}
                  >
                    <Receipt className="w-6 h-6" />
                    View Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-6 h-6" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billingHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No billing history
                  </h3>
                  <p className="text-gray-600">
                    Your billing history will appear here once you make
                    payments.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingHistory.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${getStatusColor(
                            bill.status
                          )}`}
                        >
                          {getStatusIcon(bill.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{bill.description}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(bill.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            {bill.amount.toLocaleString()} KES
                          </div>
                          <div
                            className={`text-sm capitalize ${getStatusColor(
                              bill.status
                            )}`}
                          >
                            {bill.status}
                          </div>
                        </div>
                        {bill.invoiceUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "methods" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium capitalize">
                          {method.type} {method.last4 && `•••• ${method.last4}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {method.isDefault && "Default payment method"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button variant="outline" size="sm">
                          Set Default
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}

                <Button className="w-full mt-6">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
