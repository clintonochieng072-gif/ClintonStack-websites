"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  AlertTriangle,
  CreditCard,
  User,
  Phone,
  Mail
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
  paymentMethod: string;
  transactionId: string;
  amount: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  approvedAt?: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments", {
        headers: getAuthHeaders(),
      });

      if (response.status === 403) {
        alert("Access denied. Admin privileges required.");
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      alert("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to approve this payment? This will activate the user's subscription.")) {
      return;
    }

    setActionLoading(paymentId);
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve payment");
      }

      alert("Payment approved successfully! User's subscription is now active.");
      fetchPayments(); // Refresh the list
    } catch (error: any) {
      console.error("Error approving payment:", error);
      alert(error.message || "Failed to approve payment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    setActionLoading(paymentId);
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject payment");
      }

      alert("Payment rejected successfully.");
      fetchPayments(); // Refresh the list
    } catch (error: any) {
      console.error("Error rejecting payment:", error);
      alert(error.message || "Failed to reject payment");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
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
            Manual Payment Approvals
          </h1>
          <p className="text-gray-600">
            Review and approve manual payment submissions from users.
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No payments found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ? "Try adjusting your search terms." : "No manual payments have been submitted yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(payment.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(payment.status)}
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(payment.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {payment.fullName}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3" />
                            {payment.email}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3" />
                            {payment.phoneNumber}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900">Plan Details</h4>
                          <p className="text-sm text-gray-600">{payment.planName}</p>
                          <p className="text-sm text-gray-600">KES {payment.planAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 capitalize">{payment.planType}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900">Payment Info</h4>
                          <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                          <p className="text-sm text-gray-600 font-mono">{payment.transactionId}</p>
                          <p className="text-sm text-gray-600">Amount: KES {payment.amount}</p>
                        </div>
                      </div>

                      {payment.notes && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{payment.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {payment.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleApprovePayment(payment._id)}
                            disabled={actionLoading === payment._id}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            {actionLoading === payment._id ? "Approving..." : "Approve"}
                          </Button>
                          <Button
                            onClick={() => handleRejectPayment(payment._id)}
                            disabled={actionLoading === payment._id}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            {actionLoading === payment._id ? "Rejecting..." : "Reject"}
                          </Button>
                        </>
                      )}
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