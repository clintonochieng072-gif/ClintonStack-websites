"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { getAuthHeaders } from "@/lib/utils";

interface ManualPaymentFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface Plan {
  type: "monthly" | "lifetime";
  name: string;
  price: number;
  description: string;
}

const plans: Plan[] = [
  {
    type: "monthly",
    name: "Monthly Subscription",
    price: 999,
    description: "Perfect for growing businesses",
  },
  {
    type: "lifetime",
    name: "Lifetime Access",
    price: 5,
    description: "One-time payment, forever access",
  },
];

export default function ManualPaymentForm({
  onSuccess,
  onClose,
}: ManualPaymentFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    paymentMethod: "",
    transactionId: "",
    amount: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!selectedPlan) {
      setErrorMessage("Please select a plan");
      return false;
    }
    if (!formData.fullName.trim()) {
      setErrorMessage("Full name is required");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setErrorMessage("Phone number is required");
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Email is required");
      return false;
    }
    if (!formData.paymentMethod.trim()) {
      setErrorMessage("Payment method is required");
      return false;
    }
    if (!formData.transactionId.trim()) {
      setErrorMessage("Transaction ID/Reference is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedPlan) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/payments/manual", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          planType: selectedPlan.type,
          planName: selectedPlan.name,
          planAmount: selectedPlan.price,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit payment details");
      }

      setSubmitStatus("success");

      // Wait a moment then notify success
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 2000);
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(
        error.message || "Failed to submit payment details. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Details Submitted!
        </h3>
        <p className="text-gray-600">
          Your payment details have been submitted for review. We'll approve
          your subscription within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Manual Payment
        </h2>
        <p className="text-gray-600">
          Submit your payment details manually. We'll review and approve your
          subscription.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.type}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPlan?.type === plan.type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    KES {plan.price.toLocaleString()}
                    {plan.type === "monthly" && (
                      <span className="text-sm font-normal">/month</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {plan.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  placeholder="+254712345678"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <Input
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                  placeholder="e.g., M-Pesa, Bank Transfer"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID/Reference *
                </label>
                <Input
                  value={formData.transactionId}
                  onChange={(e) =>
                    handleInputChange("transactionId", e.target.value)
                  }
                  placeholder="Enter transaction reference"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid (KES)
              </label>
              <Input
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="e.g., 999"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information about your payment..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !selectedPlan}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Submit Payment Details
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Your payment will be reviewed and approved within 24 hours.</p>
          <p>You'll receive an email confirmation once approved.</p>
        </div>
      </form>
    </div>
  );
}
