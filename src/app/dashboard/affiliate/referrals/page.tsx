"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Filter, Users, TrendingUp, DollarSign } from "lucide-react";
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

interface ReferralStats {
  totalReferrals: number;
  paidReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export default function AffiliateReferralsPage() {
  const { user } = useGlobalContext();
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");

  useEffect(() => {
    if (user && user.role === "affiliate") {
      fetchReferrals();
    } else if (user && user.role !== "affiliate") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  useEffect(() => {
    filterReferrals();
  }, [referrals, searchTerm, statusFilter]);

  const fetchReferrals = async () => {
    try {
      const response = await fetch("/api/affiliate/referrals");
      if (response.ok) {
        const referralsData = await response.json();
        setReferrals(referralsData);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterReferrals = () => {
    let filtered = referrals;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (referral) =>
          referral.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          referral.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          referral.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((referral) => referral.paymentStatus === statusFilter);
    }

    setFilteredReferrals(filtered);
  };

  const stats: ReferralStats = {
    totalReferrals: referrals.length,
    paidReferrals: referrals.filter(r => r.paymentStatus === "paid").length,
    totalEarnings: referrals.reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
    pendingEarnings: referrals
      .filter(r => r.paymentStatus === "pending")
      .reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referrals...</p>
        </div>
      </div>
    );
  }

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
                  Referral Management
                </h1>
                <p className="text-sm text-gray-600">
                  Track and manage your referrals
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Referrals</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.totalReferrals}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Paid Referrals</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900">{stats.paidReferrals}</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total Earnings</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900">KES {stats.totalEarnings}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 sm:p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Pending Earnings</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-900">KES {stats.pendingEarnings}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "paid" | "pending")}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReferrals.length > 0 ? (
                  filteredReferrals.map((referral) => (
                    <tr key={referral._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {referral.clientName || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.clientEmail || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referral.productName || "General"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(referral.signupDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
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
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {referral.commissionEarned > 0
                          ? `KES ${referral.commissionEarned}`
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 sm:px-6 py-8 text-center text-gray-500"
                    >
                      {referrals.length === 0
                        ? "No referrals yet. Share your referral link to start earning!"
                        : "No referrals match your search criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary */}
        {filteredReferrals.length !== referrals.length && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredReferrals.length} of {referrals.length} referrals
          </div>
        )}
      </div>
    </div>
  );
}