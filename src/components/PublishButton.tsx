"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import ManualPaymentModal from "./ManualPaymentModal";
import { getAuthHeaders } from "@/lib/utils";
import { useGlobal } from "@/context/GlobalContext";

const PublishButton = ({ siteId }: { siteId: string }) => {
  const { user, authLoading } = useGlobal();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const userHasPaid = user
    ? user.has_paid ||
      user.subscriptionStatus === "active" ||
      user.role === "admin"
    : false;

  const checkingPayment = authLoading;

  const handlePublish = async () => {
    if (!userHasPaid) {
      setShowPaymentModal(true);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/site/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || "Site published successfully!");
      } else {
        setMessage(data.message || "Failed to publish site.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while publishing.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setUserHasPaid(true);
    setShowPaymentModal(false);
    // Optionally trigger publish after payment
    // handlePublish();
  };

  if (checkingPayment) {
    return (
      <div className="flex flex-col gap-2">
        <Button disabled variant="default" className="bg-gray-400">
          <Upload className="w-4 h-4 mr-2" />
          Checking Payment Status...
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          onClick={handlePublish}
          disabled={loading}
          variant="default"
          className="bg-green-600 hover:bg-green-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          {loading
            ? "Publishing..."
            : userHasPaid
            ? "Publish Site"
            : "Subscribe to Publish"}
        </Button>

        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.includes("success")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <span>{message}</span>
          </div>
        )}
      </div>

      <ManualPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default PublishButton;
