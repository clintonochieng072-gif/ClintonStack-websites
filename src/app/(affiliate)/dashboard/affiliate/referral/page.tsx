"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Copy, Share2, QrCode, ExternalLink } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import AffiliateSidebar from "@/components/AffiliateSidebar";

interface AffiliateStats {
  referralCode: string;
}

export default function AffiliateReferralPage() {
  const { user } = useGlobalContext();
  const router = useRouter();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === "affiliate") {
      fetchStats();
    } else if (user && user.role !== "affiliate") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/affiliate/stats");
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!stats?.referralCode) return;

    setCopyLoading(true);
    try {
      const referralUrl = `${window.location.origin}/client-signup?ref=${stats.referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      alert("Referral link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy link. Please try again.");
    } finally {
      setCopyLoading(false);
    }
  };

  const shareReferralLink = async () => {
    if (!stats?.referralCode) return;

    const referralUrl = `${window.location.origin}/client-signup?ref=${stats.referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join ClintonStack",
          text: "Create your professional website with ClintonStack. Use my referral link to get started!",
          url: referralUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const referralUrl = stats?.referralCode
    ? `${window.location.origin}/client-signup?ref=${stats.referralCode}`
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="hidden lg:block">
        <AffiliateSidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden">
          <AffiliateSidebar mobile onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Your Referral Link
                </h1>
                <p className="text-sm text-gray-600">
                  Share this link to start earning commissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Referral Link Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Share Your Referral Link
              </h2>
              <p className="text-gray-600">
                Earn commissions when people sign up using your unique link
              </p>
            </div>

            {/* Link Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Referral Link
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-mono"
                />
                <button
                  onClick={copyReferralLink}
                  disabled={copyLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {copyLoading ? "Copying..." : "Copy"}
                  </span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={shareReferralLink}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share Link</span>
              </button>

              <a
                href={referralUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="font-medium">Test Link</span>
              </a>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              How Referrals Work
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Share Your Link</h4>
                <p className="text-sm text-gray-600">
                  Send your referral link to potential customers
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">They Sign Up</h4>
                <p className="text-sm text-gray-600">
                  When they create an account using your link
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">You Earn</h4>
                <p className="text-sm text-gray-600">
                  Get commissions from their payments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}