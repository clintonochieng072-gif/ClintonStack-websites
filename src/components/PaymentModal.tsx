"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, CheckCircle, X } from "lucide-react";
import { getAuthHeaders } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Plan {
  type: "monthly" | "lifetime";
  name: string;
  price: number;
  description: string;
  features: string[];
}

const plans: Plan[] = [
  {
    type: "monthly",
    name: "Monthly Subscription",
    price: 999,
    description: "Perfect for growing businesses",
    features: [
      "All website features unlocked",
      "Monthly billing",
      "Cancel anytime",
      "Priority support",
    ],
  },
  {
    type: "lifetime",
    name: "Lifetime Access",
    price: 5,
    description: "One-time payment, forever access",
    features: [
      "All features forever",
      "No recurring payments",
      "Lifetime updates",
      "VIP support",
    ],
  },
];

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("+254");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [lifetimeAvailable, setLifetimeAvailable] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Fetch lifetime availability
      fetch("/api/plans", { headers: getAuthHeaders() })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLifetimeAvailable(data.lifetimeAvailable);
          }
        })
        .catch((error) => console.error("Error fetching plans:", error));
    }
  }, [isOpen]);

  const validatePhoneNumber = (phone: string) => {
    // Kenyan phone number formats: 254XXXXXXXXX, +254XXXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
    const kenyanPhoneRegex = /^(?:\+?254|0)([17]\d{8}|1\d{8})$/;
    return kenyanPhoneRegex.test(phone.replace(/\s+/g, ""));
  };

  const handlePayment = async () => {
    if (!selectedPlan || !phoneNumber) return;

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage(
        "Please enter a valid Kenyan phone number (e.g., 254712345678 or 0712345678)"
      );
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      // Initiate payment
      const response = await fetch("/api/billing/pay", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          phoneNumber,
          planType: selectedPlan.type,
          amount: selectedPlan.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment initiation failed");
      }

      // Start polling for payment status
      pollPaymentStatus(data.data.transactionId);
    } catch (error: any) {
      setPaymentStatus("error");
      setErrorMessage(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/billing/status?transactionId=${transactionId}`,
          {
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();

        if (data.success) {
          if (data.data.status === "success") {
            setPaymentStatus("success");
            setIsProcessing(false);
            clearInterval(pollInterval);

            // Wait a moment then close modal and notify success
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
          } else if (data.data.status === "failed") {
            setPaymentStatus("error");
            setErrorMessage("Payment was declined. Please try again.");
            setIsProcessing(false);
            clearInterval(pollInterval);
          }
          // Continue polling if still pending
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === "processing") {
        setPaymentStatus("error");
        setErrorMessage(
          "Payment timeout. Please check your phone and try again."
        );
        setIsProcessing(false);
      }
    }, 300000); // 5 minutes
  };

  const resetModal = () => {
    setSelectedPlan(null);
    setPhoneNumber("+254");
    setIsProcessing(false);
    setPaymentStatus("idle");
    setErrorMessage("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {paymentStatus === "success"
              ? "Payment Successful!"
              : "Choose Your Plan"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {paymentStatus === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Subscription Activated!
              </h3>
              <p className="text-gray-600">
                Your {selectedPlan?.name.toLowerCase()} is now active. You can
                now publish your website.
              </p>
            </div>
          ) : (
            <>
              {/* Plan Selection */}
              {!selectedPlan ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-6">
                    Choose a subscription plan to unlock website publishing:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {plans
                      .filter(
                        (plan) => plan.type !== "lifetime" || lifetimeAvailable
                      )
                      .map((plan) => (
                        <Card
                          key={plan.type}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            plan.type === "lifetime"
                              ? "border-yellow-200 bg-yellow-50"
                              : ""
                          }`}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{plan.name}</span>
                              {plan.type === "lifetime" && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Limited Time
                                </span>
                              )}
                            </CardTitle>
                            <div className="text-3xl font-bold text-blue-600">
                              KES {plan.price.toLocaleString()}
                              {plan.type === "monthly" && (
                                <span className="text-sm font-normal">
                                  /month
                                </span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 mb-4">
                              {plan.description}
                            </p>
                            <ul className="space-y-2">
                              {plan.features.map((feature, index) => (
                                <li
                                  key={index}
                                  className="flex items-center text-sm"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ) : (
                /* Payment Form */
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{selectedPlan.name}</h3>
                      <p className="text-sm text-gray-600">
                        KES {selectedPlan.price.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlan(null)}
                      disabled={isProcessing}
                    >
                      Change Plan
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isProcessing}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter your phone number for IntaSend M-Pesa payment
                        (e.g., 0712345678 or 254712345678)
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{errorMessage}</p>
                      </div>
                    )}

                    <Button
                      onClick={handlePayment}
                      disabled={!phoneNumber || isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {paymentStatus === "processing"
                            ? "Processing STK Push…"
                            : "Checking Status..."}
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay KES {selectedPlan.price.toLocaleString()} with
                          IntaSend
                        </>
                      )}
                    </Button>

                    {paymentStatus === "processing" && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-800">
                          📱 Check your phone and complete the M-Pesa STK push
                          prompt.
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          We'll automatically detect when the payment is
                          successful.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
