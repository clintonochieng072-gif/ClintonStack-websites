"use client";

import { useState, useEffect } from "react";

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userUsername: string;
  amount: number;
  phoneNumber: string;
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  failureReason?: string;
  createdAt: string;
  processedAt?: string;
}

interface WithdrawalStats {
  totalPending: number;
  totalCompleted: number;
  totalFailed: number;
  totalAmount: number;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [stats, setStats] = useState<WithdrawalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "failed"
  >("pending");

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch(
        `/api/admin/withdrawals/list?status=${filter}`
      );
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals);

        // Calculate stats
        const totalPending = data.withdrawals.filter(
          (w: WithdrawalRequest) => w.status === "pending"
        ).length;
        const totalCompleted = data.withdrawals.filter(
          (w: WithdrawalRequest) => w.status === "completed"
        ).length;
        const totalFailed = data.withdrawals.filter(
          (w: WithdrawalRequest) => w.status === "failed"
        ).length;
        const totalAmount = data.withdrawals
          .filter((w: WithdrawalRequest) => w.status === "completed")
          .reduce((sum: number, w: WithdrawalRequest) => sum + w.amount, 0);

        setStats({
          totalPending,
          totalCompleted,
          totalFailed,
          totalAmount,
        });
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (
    withdrawalId: string,
    action: "approve" | "reject"
  ) => {
    setProcessingId(withdrawalId);
    try {
      const response = await fetch("/api/admin/withdrawals/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ withdrawalId, action }),
      });

      if (response.ok) {
        alert(`Withdrawal ${action}d successfully`);
        fetchWithdrawals(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${action} withdrawal`);
      }
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      alert(`Failed to ${action} withdrawal`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Withdrawal Management
        </h1>
        <p className="text-gray-500 mt-1">
          Manage affiliate withdrawal requests
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Pending Requests
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.totalPending}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.totalCompleted}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Failed</h3>
            <p className="text-3xl font-bold text-red-600">
              {stats.totalFailed}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Total Paid Out
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              KES {stats.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex space-x-4 mb-4">
          {[
            {
              key: "pending",
              label: "Pending",
              count: stats?.totalPending || 0,
            },
            {
              key: "completed",
              label: "Completed",
              count: stats?.totalCompleted || 0,
            },
            { key: "failed", label: "Failed", count: stats?.totalFailed || 0 },
            { key: "all", label: "All", count: withdrawals.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No withdrawal requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affiliate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {withdrawal.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {withdrawal.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KES {withdrawal.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {withdrawal.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          withdrawal.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : withdrawal.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                      {withdrawal.transactionId && (
                        <div className="text-xs text-gray-500 mt-1">
                          TX: {withdrawal.transactionId}
                        </div>
                      )}
                      {withdrawal.failureReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {withdrawal.failureReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {withdrawal.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleApproval(withdrawal.id, "approve")
                            }
                            disabled={processingId === withdrawal.id}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {processingId === withdrawal.id
                              ? "Processing..."
                              : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              handleApproval(withdrawal.id, "reject")
                            }
                            disabled={processingId === withdrawal.id}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {withdrawal.status === "completed" && (
                        <span className="text-green-600">Completed</span>
                      )}
                      {withdrawal.status === "failed" && (
                        <span className="text-red-600">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
