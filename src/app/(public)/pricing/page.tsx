"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Phone,
  CheckCircle,
  XCircle,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BillingPlan {
  type: "monthly" | "one_time";
  name: string;
  price: number;
  description: string;
  features: string[];
}

const BILLING_PLANS: BillingPlan[] = [
  {
    type: "monthly",
    name: "Monthly Plan",
    price: 999,
    description: "Auto-renews every 30 days",
    features: [
      "Publish unlimited properties",
      "Access to live property pages",
      "30-day auto-renewal",
      "Access locked if unpaid",
    ],
  },
  {
    type: "one_time",
    name: "One-time Plan",
    price: 5,
    description: "Lifetime access (first 10 users only)",
    features: [
      "Publish unlimited properties",
      "Lifetime access to live pages",
      "No recurring payments",
      "Available for first 10 users",
    ],
  },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(
    null
  );
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed" | null
  >(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const router = useRouter();

  const handleSelectPlan = (plan: BillingPlan) => {
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const initiatePropertyPayment = async () => {
    if (!selectedPlan || !phoneNumber) return;

    setPaymentInitiated(true);
    setPaymentMessage("");

    try {
      // For demo purposes, we'll use a placeholder property ID
      // In real implementation, this would come from the property being published
      const propertyId = "demo-property-id";

      const response = await fetch("/api/properties/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: propertyId,
          planType: selectedPlan.type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCheckoutRequestId(data.data.checkoutRequestId);
        setPaymentStatus("pending");
        setPaymentMessage(
          data.data.customerMessage ||
            "Payment initiated. Please complete the payment on your phone."
        );
        setShowPaymentDialog(false);
        // Start polling for payment status
        startPaymentStatusPolling(data.data.checkoutRequestId);
      } else {
        setPaymentMessage(data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setPaymentMessage("Failed to initiate payment. Please try again.");
    } finally {
      setPaymentInitiated(false);
    }
  };

  const startPaymentStatusPolling = (requestId: string) => {
    let pollCount = 0;
    const maxPolls = 24; // 2 minutes at 5 second intervals

    const pollStatus = async () => {
      pollCount++;
      try {
        const response = await fetch(
          `/api/payments/mpesa/status?CheckoutRequestID=${requestId}`
        );
        const data = await response.json();

        if (data.success) {
          const status = data.data.payment.status;
          setPaymentStatus(status);

          if (status === "success") {
            setPaymentMessage("Payment successful! Your property is now live.");
            setTimeout(() => router.push("/dashboard"), 2000);
          } else if (status === "failed") {
            setPaymentMessage("Payment failed. Please try again.");
          }
        }
        return false;
      } catch (error) {
        console.error("Error checking payment status:", error);
        return false;
      }
    };

    // Check immediately
    pollStatus();

    // Then poll every 5 seconds
    const interval = setInterval(async () => {
      const shouldStop = await pollStatus();
      if (shouldStop || pollCount >= maxPolls) {
        clearInterval(interval);
        if (pollCount >= maxPolls && paymentStatus === "pending") {
          setPaymentMessage(
            "Payment status check timed out. Please check manually or contact support."
          );
        }
      }
    }, 5000);
  };

  const checkPaymentStatus = async () => {
    if (!checkoutRequestId) return;

    setCheckingStatus(true);
    try {
      const response = await fetch(
        `/api/payments/mpesa/status?CheckoutRequestID=${checkoutRequestId}`
      );
      const data = await response.json();

      if (data.success) {
        const status = data.data.payment.status;
        setPaymentStatus(status);

        if (status === "success") {
          setPaymentMessage("Payment successful! Your property is now live.");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else if (status === "failed") {
          setPaymentMessage("Payment failed. Please try again.");
        } else {
          setPaymentMessage("Payment is still processing. Please wait...");
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setPaymentMessage("Failed to check payment status. Please try again.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const resetPaymentFlow = () => {
    setShowPaymentDialog(false);
    setSelectedPlan(null);
    setPhoneNumber("");
    setPaymentInitiated(false);
    setCheckoutRequestId(null);
    setPaymentStatus(null);
    setCheckingStatus(false);
    setPaymentMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ClintonStack Property Publishing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose a plan to publish your property live. Only paid properties
            are visible to the public.
          </p>
        </div>

        {/* Billing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {BILLING_PLANS.map((plan) => (
            <Card key={plan.type} className="border-gray-200">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 ml-1">KES</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Confirm Payment
              </DialogTitle>
              <DialogDescription>
                Complete payment to publish your property live.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedPlan && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">Payment Summary</p>
                  <p className="text-sm text-gray-600">
                    Plan: {selectedPlan.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Amount: KES {selectedPlan.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedPlan.description}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPaymentDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={initiatePropertyPayment}
                  disabled={paymentInitiated}
                  className="flex-1"
                >
                  {paymentInitiated ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Pay & Publish"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Status Display */}
        {paymentStatus && (
          <div className="max-w-2xl mx-auto mb-8">
            <div
              className={`p-4 rounded-lg border ${
                paymentStatus === "success"
                  ? "bg-green-50 border-green-200"
                  : paymentStatus === "failed"
                  ? "bg-red-50 border-red-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {paymentStatus === "success" ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : paymentStatus === "failed" ? (
                  <XCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      paymentStatus === "success"
                        ? "text-green-800"
                        : paymentStatus === "failed"
                        ? "text-red-800"
                        : "text-blue-800"
                    }`}
                  >
                    {paymentStatus === "success"
                      ? "Payment Successful!"
                      : paymentStatus === "failed"
                      ? "Payment Failed"
                      : "Payment Processing"}
                  </h3>
                  <p
                    className={`text-sm ${
                      paymentStatus === "success"
                        ? "text-green-700"
                        : paymentStatus === "failed"
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}
                  >
                    {paymentMessage}
                  </p>
                </div>
                {paymentStatus === "pending" && (
                  <Button
                    onClick={checkPaymentStatus}
                    disabled={checkingStatus}
                    size="sm"
                    variant="outline"
                  >
                    {checkingStatus ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                        Checking...
                      </>
                    ) : (
                      "Check Status"
                    )}
                  </Button>
                )}
                {paymentStatus !== "pending" && (
                  <Button
                    onClick={resetPaymentFlow}
                    size="sm"
                    variant="outline"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <p className="text-gray-600">
                Create and preview your property listing
              </p>
            </div>
            <div>
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <p className="text-gray-600">
                Choose a plan and complete M-Pesa payment
              </p>
            </div>
            <div>
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <p className="text-gray-600">
                Property goes live and stays active based on your plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
