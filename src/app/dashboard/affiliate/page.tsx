"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Menu,
  Copy,
  ExternalLink,
  Wallet,
  Package,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import AffiliateSidebar from "@/components/AffiliateSidebar";

interface Referral {
  _id: string;
  clientId: string;
  productId: string;
  signupDate: string;
  paymentStatus: "pending" | "paid";
  clientName?: string;
  clientEmail?: string;
  productName?: string;
  commissionEarned: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  commissionRate: number;
  features?: string[];
  pricing?: any[];
}

interface AffiliateStats {
  totalReferrals: number;
  pendingPayments: number;
  totalEarnings: number;
  withdrawableBalance: number;
  referralCode: string;
  productStats?: {
    productId: string;
    productName: string;
    referralCount: number;
    paidReferralCount: number;
    earnings: number;
  }[];
}

interface AffiliateBalance {
  availableBalance: number;
  totalEarned: number;
  withdrawalHistory: {
    withdrawalId: string;
    amount: number;
    status: "pending" | "completed" | "failed";
    requestedAt: Date;
    processedAt?: Date;
    phoneNumber?: string;
  }[];
}

export default function AffiliateDashboard() {
  const { user, logout } = useGlobalContext();
  const router = useRouter();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [balance, setBalance] = useState<AffiliateBalance | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyLoading, setCopyLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Removed countdown - commissions are immediately available

  useEffect(() => {
    if (user && user.role === "affiliate") {
      fetchAffiliateData();
    } else if (user && user.role !== "affiliate") {
      // Redirect non-affiliates
      window.location.href = "/dashboard";
    }
  }, [user]);

  const fetchAffiliateData = async () => {
    try {
      const [statsRes, referralsRes, productsRes, balanceRes] =
        await Promise.all([
          fetch("/api/affiliate/stats"),
          fetch("/api/affiliate/referrals"),
          fetch("/api/affiliate/products"),
          fetch("/api/affiliate/balance"),
        ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setReferrals(referralsData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
        // For now, select all products by default
        setSelectedProducts(productsData.map((p: Product) => p._id));
      }

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (stats?.referralCode) {
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
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!balance?.availableBalance || balance.availableBalance < 300) return;
    if (!phoneNumber.trim()) {
      alert("Please enter your M-Pesa phone number");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(\+254|0)7[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      alert(
        "Please enter a valid Kenyan Safaricom M-Pesa number (e.g., 0712345678 or +254712345678)"
      );
      return;
    }

    setWithdrawLoading(true);
    try {
      const response = await fetch("/api/affiliate/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: balance.availableBalance,
          phoneNumber: phoneNumber.trim(),
        }),
      });

      if (response.ok) {
        alert("Withdrawal request submitted successfully!");
        setPhoneNumber(""); // Clear phone number
        // Refresh data
        fetchAffiliateData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit withdrawal request");
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      alert("Failed to submit withdrawal request");
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your affiliate dashboard...
          </p>
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
                  Affiliate Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Track your referrals and earnings
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                {logoutLoading ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Here's what's happening with your affiliate program today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Total Referrals
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats?.totalReferrals || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">
                  Available Balance
                </p>
                <p className="text-3xl font-bold text-green-900">
                  KES {balance?.availableBalance || 0}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">
                  Total Earned
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  KES {balance?.totalEarned || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">
                  Success Rate
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {stats?.totalReferrals
                    ? Math.round(
                        ((stats.totalReferrals - (stats.pendingPayments || 0)) /
                          stats.totalReferrals) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <ExternalLink className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={copyReferralLink}
              disabled={copyLoading}
              className="flex items-center justify-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              <Copy className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {copyLoading ? "Copying..." : "Copy Link"}
              </span>
            </button>

            <Link
              href="/dashboard/affiliate/products"
              className="flex items-center justify-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <Package className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Promote Products
              </span>
            </Link>

            <Link
              href="/dashboard/affiliate/withdraw"
              className="flex items-center justify-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <Wallet className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Withdraw Funds
              </span>
            </Link>

            <Link
              href="/dashboard/affiliate/referrals"
              className="flex items-center justify-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
            >
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                View Referrals
              </span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>

          {referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.slice(0, 5).map((referral) => (
                <div
                  key={referral._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        New referral: {referral.clientName || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(referral.signupDate).toLocaleDateString()} •{" "}
                        {referral.productName || "General"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      +KES {referral.commissionEarned || 0}
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        referral.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {referral.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}

              {referrals.length > 5 && (
                <Link
                  href="/dashboard/affiliate/referrals"
                  className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {referrals.length} referrals →
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start promoting products to see your referral activity here.
              </p>
              <Link
                href="/dashboard/affiliate/products"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Package className="w-4 h-4 mr-2" />
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
