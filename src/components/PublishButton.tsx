"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import ManualPaymentModal from "./ManualPaymentModal";
import { getAuthHeaders } from "@/lib/utils";
import { useGlobal } from "@/context/GlobalContext";
import { pusherClient } from "@/lib/pusher-client";

const PublishButton = ({ siteId }: { siteId: string }) => {
  const { user, authLoading } = useGlobal();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [localUserHasPaid, setLocalUserHasPaid] = useState<boolean | null>(
    null
  );

  const userHasPaid =
    localUserHasPaid !== null
      ? localUserHasPaid
      : user
      ? user.has_paid ||
        user.role === "admin" ||
        user.email === "clintonochieng072@gmail.com"
      : false;

  const checkingPayment = authLoading && localUserHasPaid === null;

  // Fetch fresh user data to check payment status
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        console.log("Fresh user data from /api/auth/me:", data);
        if (data.user) {
          const hasPaid =
            data.user.has_paid ||
            data.user.role === "admin" ||
            data.user.email === "clintonochieng072@gmail.com";
          console.log("Calculated hasPaid:", hasPaid, "from", {
            has_paid: data.user.has_paid,
            role: data.user.role,
            email: data.user.email,
          });
          setLocalUserHasPaid(hasPaid);
        } else {
          console.log("No user data in response");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };

    if (!authLoading && user) {
      checkUserStatus();

      // Listen for payment approval events
      const channel = pusherClient.subscribe(`user-${user.id}`);
      channel.bind("payment-approved", () => {
        console.log("Payment approved event received, refreshing user status");
        checkUserStatus();
      });

      return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(`user-${user.id}`);
      };
    }
  }, [authLoading, user]);

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
    setLocalUserHasPaid(true);
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
