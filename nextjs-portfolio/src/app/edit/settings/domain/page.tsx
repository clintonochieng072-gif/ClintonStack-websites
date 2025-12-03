"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DomainSettingsPage() {
  const { data: siteData } = useSWR("/api/site/me", fetcher);
  const [customDomain, setCustomDomain] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setCustomDomain(site.customDomain || "");
    }
  }, [siteData]);

  const handleVerifyDomain = async () => {
    setIsVerifying(true);
    setVerificationStatus("idle");

    // TODO: Implement domain verification API call
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationStatus("success"); // or "error"
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Custom Domain</h2>
        <p className="text-gray-600">Connect your own domain to your website</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domain Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Domain
            </label>
            <div className="flex space-x-2">
              <Input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="www.yourdomain.com"
              />
              <Button
                onClick={handleVerifyDomain}
                disabled={!customDomain || isVerifying}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>

          {verificationStatus === "success" && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 text-green-800 rounded-md">
              <CheckCircle className="w-5 h-5" />
              <span>Domain verified successfully!</span>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-800 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span>
                Domain verification failed. Please check your DNS settings.
              </span>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">
              DNS Configuration
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              To connect your domain, add the following CNAME record to your DNS
              settings:
            </p>
            <div className="font-mono text-sm bg-white p-2 rounded border">
              <div>
                <strong>Host:</strong> www
              </div>
              <div>
                <strong>Type:</strong> CNAME
              </div>
              <div>
                <strong>Value:</strong> yoursite.clintonstack.com
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
