"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const PublishButton = ({ siteId }: { siteId: string }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handlePublish = async () => {
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

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handlePublish}
        disabled={loading}
        variant="default"
        className="bg-green-600 hover:bg-green-700"
      >
        <Upload className="w-4 h-4 mr-2" />
        {loading ? "Publishing..." : "Publish Site"}
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
  );
};

export default PublishButton;
