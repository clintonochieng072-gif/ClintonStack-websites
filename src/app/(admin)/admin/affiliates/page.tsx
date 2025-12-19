"use client";

import { useState, useEffect } from "react";
import { Search, Users, DollarSign, TrendingUp } from "lucide-react";

interface Affiliate {
  id: string;
  user: {
    name: string;
    email: string;
    withdrawalRequests: {
      id: string;
      amount: number;
      phoneNumber: string;
      status: string;
    }[];
  };
  availableBalance: number;
  totalEarned: number;
  mpesaName?: string;
  status: string;
  commissions: {
    id: string;
    commissionAmount: number;
    status: string;
  }[];
  referrals: {
    id: string;
  }[];
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("totalEarned");

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const response = await fetch("/api/admin/affiliates");
      if (response.ok) {
        const data = await response.json();
        setAffiliates(data.affiliates);
      }
    } catch (error) {
      console.error("Error fetching affiliates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedAffiliates = affiliates
    .filter(
      (a) =>
        a.user.name.toLowerCase().includes(search.toLowerCase()) ||
        a.user.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "totalEarned":
          return b.totalEarned - a.totalEarned;
        case "availableBalance":
          return b.availableBalance - a.availableBalance;
        case "referrals":
          return b.referrals.length - a.referrals.length;
        case "name":
          return a.user.name.localeCompare(b.user.name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Affiliates</h1>
        <p className="text-gray-600 mt-1">
          Manage and monitor all affiliate accounts
        </p>
      </div>

      {/* Search and Sort */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="totalEarned">Sort by Total Earned</option>
              <option value="availableBalance">
                Sort by Available Balance
              </option>
              <option value="referrals">Sort by Referrals</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Affiliates Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending Withdrawal Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MPESA Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MPESA Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedAffiliates.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No affiliates found
                  </td>
                </tr>
              ) : (
                filteredAndSortedAffiliates.map((affiliate) => {
                  const pendingWithdrawals = affiliate.user.withdrawalRequests.filter(
                    (w: any) => w.status === "pending"
                  );
                  const latestWithdrawal = affiliate.user.withdrawalRequests[0]; // Most recent

                  return (
                    <tr key={affiliate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {affiliate.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {affiliate.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          KES {affiliate.availableBalance.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {affiliate.referrals.length}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-orange-600">
                          {pendingWithdrawals.length > 0
                            ? `KES ${pendingWithdrawals[0].amount.toLocaleString()}`
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {latestWithdrawal?.phoneNumber || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {affiliate.mpesaName || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          affiliate.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {affiliate.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
