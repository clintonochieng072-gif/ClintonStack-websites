"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle,
  X,
  AlertTriangle,
  Phone,
  MessageCircle,
} from "lucide-react";
import { getAuthHeaders } from "@/lib/utils";

interface ManualPaymentModalProps {
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
    price: 3999,
    description: "One-time payment, forever access",
    features: [
      "All features forever",
      "No recurring payments",
      "Lifetime updates",
      "VIP support",
    ],
  },
];

export default function ManualPaymentModal({
  isOpen,
  onClose,
  onSuccess,
}: ManualPaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [remainingSlots, setRemainingSlots] = useState(10);

  useEffect(() => {
    if (isOpen) {
      // Fetch remaining lifetime slots
      fetch("/api/payments/manual/slots", { headers: getAuthHeaders() })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setRemainingSlots(data.remainingSlots);
          }
        })
        .catch((error) => console.error("Error fetching slots:", error));
    }
  }, [isOpen]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    // Kenyan phone number formats: 254XXXXXXXXX, +254XXXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
    const kenyanPhoneRegex = /^(?:\+?254|0)([17]\d{8}|1\d{8})$/;
    return kenyanPhoneRegex.test(phone.replace(/\s+/g, ""));
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan || !fullName || !phoneNumber || !email) return;

    // Validate inputs
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

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
      const response = await fetch("/api/payments/manual", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          planType: selectedPlan.type,
          planName: selectedPlan.name,
          planAmount: selectedPlan.price,
          fullName,
          phoneNumber,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit payment request");
      }

      setPaymentStatus("success");
      setIsProcessing(false);

      // Wait a moment then close modal and notify success
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (error: any) {
      setPaymentStatus("error");
      setErrorMessage(
        error.message || "Failed to submit payment request. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setSelectedPlan(null);
    setFullName("");
    setPhoneNumber("");
    setEmail("");
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
              ? "Payment Request Submitted!"
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
                Payment Request Submitted!
              </h3>
              <p className="text-gray-600 mb-4">
                Your payment request has been submitted and is awaiting
                approval. You'll receive a notification once it's approved.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Next Steps:</strong> Send the payment to +254768524480
                  and contact our support team using the floating buttons to
                  approve your account.
                </p>
              </div>
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
                    {plans.map((plan) => (
                      <Card
                        key={plan.type}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          plan.type === "lifetime"
                            ? "border-orange-200 bg-orange-50"
                            : ""
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{plan.name}</span>
                            {plan.type === "lifetime" && (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  Limited Offer
                                </span>
                                <span className="text-xs text-gray-500">
                                  {remainingSlots} slots left
                                </span>
                              </div>
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
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>

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
                        Enter your phone number for contact purposes
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{errorMessage}</p>
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-2">
                            Payment Instructions
                          </h4>
                          <p className="text-blue-800 text-sm mb-2">
                            Send{" "}
                            <strong>
                              KES {selectedPlan.price.toLocaleString()}
                            </strong>{" "}
                            to <strong>+254768524480</strong>
                          </p>
                          <p className="text-blue-800 text-sm">
                            After payment, contact our support team using the
                            floating phone/WhatsApp buttons to approve your
                            account.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmitPayment}
                      disabled={
                        !fullName || !phoneNumber || !email || isProcessing
                      }
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit Payment Request
                        </>
                      )}
                    </Button>
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
