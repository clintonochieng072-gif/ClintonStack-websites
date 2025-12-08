"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";

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

export default function AffiliateDashboard() {
  const { user, logout } = useGlobalContext();
  const router = useRouter();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyLoading, setCopyLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

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
      const [statsRes, referralsRes, productsRes] = await Promise.all([
        fetch("/api/affiliate/stats"),
        fetch("/api/affiliate/referrals"),
        fetch("/api/affiliate/products"),
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
    if (!stats?.withdrawableBalance || stats.withdrawableBalance < 1000) return;

    setWithdrawLoading(true);
    try {
      const response = await fetch("/api/affiliate/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: stats.withdrawableBalance,
          paymentMethod: "mpesa", // Default to M-Pesa
          paymentDetails: null,
        }),
      });

      if (response.ok) {
        alert("Withdrawal request submitted successfully!");
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Affiliate Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Track your referrals and earnings
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Total Referrals
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalReferrals || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Pending Payments
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {stats?.pendingPayments || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Total Earnings
            </h3>
            <p className="text-3xl font-bold text-green-600">
              KES {stats?.totalEarnings || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Withdrawable Balance
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              KES {stats?.withdrawableBalance || 0}
            </p>
          </div>
        </div>

        {/* Product Performance */}
        {stats?.productStats && stats.productStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Product Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.productStats.map((productStat) => (
                <div
                  key={productStat.productId}
                  className="border rounded-lg p-4"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {productStat.productName}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referrals:</span>
                      <span className="font-medium">
                        {productStat.referralCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid:</span>
                      <span className="font-medium text-green-600">
                        {productStat.paidReferralCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earnings:</span>
                      <span className="font-medium text-green-600">
                        KES {productStat.earnings}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products to Promote */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Products to Promote
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.description}
                    </p>
                    <p className="text-sm font-medium text-green-600 mt-2">
                      Commission: KES {product.commissionRate}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product._id]);
                      } else {
                        setSelectedProducts(
                          selectedProducts.filter((id) => id !== product._id)
                        );
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                {selectedProducts.includes(product._id) && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Referral Link:</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/client-signup?ref=${
                          stats?.referralCode || ""
                        }&product=${product.slug}`}
                        className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded bg-gray-50"
                      />
                      <button
                        onClick={async () => {
                          setCopyLoading(true);
                          try {
                            const link = `${
                              window.location.origin
                            }/client-signup?ref=${
                              stats?.referralCode || ""
                            }&product=${product.slug}`;
                            await navigator.clipboard.writeText(link);
                            alert(`Referral link for ${product.name} copied!`);
                          } catch (error) {
                            alert("Failed to copy link");
                          } finally {
                            setCopyLoading(false);
                          }
                        }}
                        disabled={copyLoading}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {copyLoading ? "..." : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No products available for promotion at this time.
            </p>
          )}
        </div>

        {/* Referral Link */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Referral Link
          </h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              readOnly
              value={
                stats?.referralCode
                  ? `${window.location.origin}/client-signup?ref=${stats.referralCode}`
                  : ""
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <button
              onClick={copyReferralLink}
              disabled={copyLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {copyLoading ? "Copying..." : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Referral Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Referral Management
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signup Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {referral.clientName || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.clientEmail || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {referral.productName || "General"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(referral.signupDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          referral.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {referral.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {referral.commissionEarned > 0
                        ? `KES ${referral.commissionEarned}`
                        : "-"}
                    </td>
                  </tr>
                ))}
                {referrals.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No referrals yet. Share your referral link to start
                      earning!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Withdraw Funds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Current Balance
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                KES {stats?.withdrawableBalance || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Available for withdrawal
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Request Withdrawal
              </h3>
              {(stats?.withdrawableBalance || 0) >= 1000 ? (
                <button
                  onClick={handleWithdrawal}
                  disabled={withdrawLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {withdrawLoading ? "Processing..." : "Withdraw Funds"}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Minimum withdrawal: KES 1,000
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile & Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Profile & Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Affiliate Profile
              </h3>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Referral Code:</strong> {stats?.referralCode}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Security
              </h3>
              <button
                onClick={() => alert("Password change feature coming soon!")}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
