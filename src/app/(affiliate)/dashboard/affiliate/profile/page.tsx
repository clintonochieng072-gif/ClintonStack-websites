"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  User,
  Mail,
  Key,
  Shield,
  Save,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import { getAuthHeaders, getBaseUrl } from "@/lib/utils";
import AffiliateSidebar from "@/components/AffiliateSidebar";

interface AffiliateStats {
  referralCode: string;
}

export default function AffiliateProfilePage() {
  const { user } = useGlobalContext();
  const router = useRouter();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mpesaName: "",
    mpesaPhone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user && user.role === "affiliate") {
      fetchStats();
    } else if (user && user.role !== "affiliate") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const headers = getAuthHeaders();
      const [statsRes, affiliateRes] = await Promise.all([
        fetch("/api/affiliate/stats", { headers }),
        fetch("/api/affiliate/profile", { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (affiliateRes.ok) {
        const affiliateData = await affiliateRes.json();
        setFormData((prev) => ({
          ...prev,
          name: affiliateData.name || prev.name,
          mpesaName: affiliateData.mpesaName || "",
          mpesaPhone: affiliateData.mpesaPhone || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/affiliate/profile", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mpesaName: formData.mpesaName,
          mpesaPhone: formData.mpesaPhone,
        }),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords don't match");
      return;
    }

    if (formData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setSaving(true);
    try {
      // Here you would implement the password change API call
      alert("Password changed successfully!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyReferralLink = async () => {
    if (!stats?.referralCode) return;

    const baseUrl = getBaseUrl();
    const referralLink = `${baseUrl}/?ref=${stats.referralCode}`;

    try {
      await navigator.clipboard.writeText(referralLink);
      alert("Referral link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy referral link:", error);
      alert("Failed to copy referral link");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
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
                  Profile & Settings
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your account settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Personal Information
              </h2>
              <User className="w-6 h-6 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Name
                </label>
                <input
                  type="text"
                  value={formData.mpesaName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mpesaName: e.target.value,
                    }))
                  }
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name registered with M-Pesa
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.mpesaPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mpesaPhone: e.target.value,
                    }))
                  }
                  placeholder="0712345678 or +254712345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Safaricom M-Pesa number for payouts
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={stats?.referralCode || ""}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <span className="text-sm text-gray-500">Read-only</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Link
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={stats?.referralCode ? `${getBaseUrl()}/?ref=${stats.referralCode}` : ""}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                />
                <button
                  onClick={handleCopyReferralLink}
                  disabled={!stats?.referralCode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                {stats?.referralCode && (
                  <a
                    href={`${getBaseUrl()}/?ref=${stats.referralCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Share this link to earn commissions when people sign up
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Change Password
              </h2>
              <Key className="w-6 h-6 text-gray-400" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Shield className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900">
                      Password Requirements
                    </h4>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                      <li>At least 6 characters long</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Include at least one number</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={
                    saving ||
                    !formData.currentPassword ||
                    !formData.newPassword ||
                    !formData.confirmPassword
                  }
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
                >
                  <Key className="w-4 h-4" />
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Account Information
              </h2>
              <Shield className="w-6 h-6 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </h3>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  Active Affiliate
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </h3>
                <p className="text-sm text-gray-900">Recently</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </h3>
                <p className="text-sm text-gray-900">Affiliate Partner</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Last Login
                </h3>
                <p className="text-sm text-gray-900">Today</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Danger Zone
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              These actions are irreversible. Please be certain before
              proceeding.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() =>
                  alert("Account deactivation feature coming soon")
                }
                className="px-4 py-2 bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
              >
                Deactivate Account
              </button>

              <button
                onClick={() => alert("Contact support to delete your account")}
                className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
