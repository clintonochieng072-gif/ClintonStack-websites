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
  MessageCircle,
} from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import { getBaseUrl } from "@/lib/utils";
import AffiliateSidebar from "@/components/AffiliateSidebar";
import { pusherClient } from "@/lib/pusher-client";

interface Referral {
  _id: string;
  clientId: string;
  productId: string;
  signupDate: Date;
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
  convertedReferrals: number;
  totalEarnings: number;
  availableBalance: number;
  referralCode: string;
  affiliateId: string;
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
    processedAt?: Date | null;
    phoneNumber?: string | null;
  }[];
}

interface AffiliateDashboardClientProps {
  initialStats: AffiliateStats | null;
  initialBalance: AffiliateBalance | null;
  initialReferrals: Referral[];
  initialProducts: Product[];
  user: any;
}

export default function AffiliateDashboardClient({
  initialStats,
  initialBalance,
  initialReferrals,
  initialProducts,
  user,
}: AffiliateDashboardClientProps) {
  const router = useRouter();
  const [stats, setStats] = useState<AffiliateStats | null>(initialStats);
  const [balance, setBalance] = useState<AffiliateBalance | null>(
    initialBalance
  );
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyExplanationLoading, setCopyExplanationLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mpesaName, setMpesaName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.role === "affiliate") {
      // Subscribe to real-time updates
      const channel = pusherClient.subscribe(`affiliate-${user.id}`);
      channel.bind("commission-earned", (data: any) => {
        console.log("Commission earned:", data);
        // Update stats in real-time
        setStats((prevStats) => {
          if (!prevStats) return prevStats;
          return {
            ...prevStats,
            totalEarnings: prevStats.totalEarnings + data.commissionAmount,
            availableBalance:
              prevStats.availableBalance + data.commissionAmount,
            convertedReferrals: prevStats.convertedReferrals + 1,
          };
        });
        // Refresh data to get accurate counts
        fetchAffiliateData();
      });

      return () => {
        pusherClient.unsubscribe(`affiliate-${user.id}`);
      };
    } else if (user && user.role !== "affiliate") {
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
        setSelectedProducts(productsData.map((p: Product) => p._id));
      }

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
    }
  };

  const copyReferralLink = async () => {
    if (stats?.referralCode) {
      setCopyLoading(true);
      try {
        const baseUrl = getBaseUrl();
        const referralUrl = `${baseUrl}/?ref=${stats.referralCode}`;
        await navigator.clipboard.writeText(referralUrl);
        alert("Affiliate link copied");
      } catch (error) {
        console.error("Failed to copy:", error);
        alert("Failed to copy link. Please try again.");
      } finally {
        setCopyLoading(false);
      }
    }
  };

  const copyExplanation = async () => {
    setCopyExplanationLoading(true);
    try {
      const explanationText = `Hi 👋
ClintonStack helps real estate agents create a professional website without coding.

You get your own website where clients can view your properties online.

Your website includes:
A professional homepage
Featured properties with photos, price, and location
Sections like About, Services, Testimonials, and Contact
WhatsApp and phone buttons for easy client contact

You also get a dashboard where you:
Add and manage unlimited properties
Upload multiple images
Set prices, location, and property details
Choose featured properties
Preview and publish your website

Once published, your website goes live and clients can contact you directly.

ClintonStack handles the technical side while you focus on selling properties.`;
      await navigator.clipboard.writeText(explanationText);
      alert("Explanation copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy explanation. Please try again.");
    } finally {
      setCopyExplanationLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      // Assuming logout is handled elsewhere, or use router
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
    if (!mpesaName.trim()) {
      alert("Please enter your MPESA name");
      return;
    }

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
          mpesaName: mpesaName.trim(),
        }),
      });

      if (response.ok) {
        alert("Withdrawal request submitted successfully!");
        setPhoneNumber("");
        setMpesaName("");
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
      <header className="bg-white shadow-sm border-b">
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
            Welcome back, {user?.name || user?.username || "there"} 👋
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Here's what's happening with your affiliate program today.
          </p>
        </div>

        {/* Affiliate Link Section */}
        {stats?.referralCode ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Affiliate Link
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={`${getBaseUrl()}/?ref=${stats.referralCode}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
              />
              <button
                onClick={copyReferralLink}
                disabled={copyLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This link takes clients to the main website. Once they sign up and
              pay, you earn commission.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                Generating your affiliate link...
              </p>
            </div>
          </div>
        )}

        {/* What You Are Promoting Section */}
        <div className="bg-green-50 rounded-xl border border-green-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What You Are Promoting
          </h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              Right now, ClintonStack helps people build Real Estate websites.
            </p>
            <p>This is what you are promoting.</p>
            <p>
              When someone wants a real estate website and uses your link to
              sign up, you earn 15% commission after they pay and are approved.
            </p>
            <p>
              You don't need technical skills. You are simply helping real
              estate agents and property owners get a professional website.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Total Clicks
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats?.totalReferrals || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  People who visited via your link
                </p>
              </div>
              <ExternalLink className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">
                  Successful Signups
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {stats?.convertedReferrals || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Registered users referred by you
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">
                  Total Commissions
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  KES {stats?.totalEarnings || 0}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  From paid and approved users
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">
                  Available Balance
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  KES {stats?.availableBalance || 0}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Amount available for withdrawal
                </p>
              </div>
              <Wallet className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Withdrawal Section */}
        {(balance?.availableBalance || 0) >= 300 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Withdraw Funds
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MPESA Name
                  </label>
                  <input
                    type="text"
                    value={mpesaName}
                    onChange={(e) => setMpesaName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleWithdrawal}
                    disabled={
                      withdrawLoading ||
                      !phoneNumber.trim() ||
                      !mpesaName.trim()
                    }
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
                  >
                    {withdrawLoading
                      ? "Processing..."
                      : "Withdraw KES " + (balance?.availableBalance || 0)}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Withdrawal requests are submitted to admin for processing
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/dashboard/affiliate/referrals"
              className="flex items-center justify-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
            >
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                View Referrals
              </span>
            </Link>

            <Link
              href="/dashboard/affiliate/withdraw"
              className="flex items-center justify-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <Wallet className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Withdrawal History
              </span>
            </Link>

            <Link
              href="/dashboard/affiliate/products"
              className="flex items-center justify-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <Package className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Promote Products
              </span>
            </Link>
          </div>
        </div>

        {/* How to Earn Section */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How to Earn
          </h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              Earn 15% commission for every referred user who completes payment.
            </p>
            <p>A commission is only settled when:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>The referred user subscribes (monthly or one-time), and</li>
              <li>hasPaid = true, and</li>
              <li>The user is manually approved by the admin</li>
            </ul>
            <p>Once approved, the commission is credited to your balance.</p>
            <p>No commission is earned for unpaid or unapproved users.</p>
          </div>
        </div>

        {/* How to Promote Section */}
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How to Promote ClintonStack
          </h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p>Look for people who need real estate websites.</p>
            <p>You can find them on:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Facebook real estate and business groups</li>
              <li>WhatsApp groups</li>
              <li>Jiji sellers and agents</li>
              <li>Instagram and TikTok real estate pages</li>
              <li>Real estate agents, brokers, and developers</li>
              <li>Friends or contacts starting property businesses</li>
            </ul>
            <p>
              Share your affiliate link and explain how ClintonStack helps them
              get a professional website.
            </p>
          </div>
        </div>

        {/* How the Real Estate System Works Section */}
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              How the Real Estate Website Works (Copy & Send to Clients)
            </h2>
            <button
              onClick={copyExplanation}
              disabled={copyExplanationLoading}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copyExplanationLoading ? "Copying..." : "Copy Explanation"}
            </button>
          </div>
          <div className="text-sm text-gray-700 space-y-2 bg-white p-4 rounded-lg border">
            <p>Hi 👋</p>
            <p>
              ClintonStack helps real estate agents create a professional
              website without coding.
            </p>
            <p>
              You get your own website where clients can view your properties
              online.
            </p>
            <p>Your website includes:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>A professional homepage</li>
              <li>Featured properties with photos, price, and location</li>
              <li>Sections like About, Services, Testimonials, and Contact</li>
              <li>WhatsApp and phone buttons for easy client contact</li>
            </ul>
            <p>You also get a dashboard where you:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Add and manage unlimited properties</li>
              <li>Upload multiple images</li>
              <li>Set prices, location, and property details</li>
              <li>Choose featured properties</li>
              <li>Preview and publish your website</li>
            </ul>
            <p>
              Once published, your website goes live and clients can contact you
              directly.
            </p>
            <p>
              ClintonStack handles the technical side while you focus on selling
              properties.
            </p>
          </div>
        </div>

        {/* Join WhatsApp Group Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-300 p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Join Our Affiliate WhatsApp Group
                </h2>
                <p className="text-sm text-gray-700 mt-1">
                  Get updates, support, promotion tips, and important
                  announcements.
                </p>
              </div>
            </div>
            <a
              href="https://chat.whatsapp.com/LrRoGo2MTa1Fe9UDhsJTtz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Join WhatsApp Group
            </a>
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
                Share your affiliate link and earn once users pay and are
                approved.
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
