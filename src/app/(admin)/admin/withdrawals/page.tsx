"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface Withdrawal {
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

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch(
        "/api/admin/withdrawals/list?status=pending"
      );
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    withdrawalId: string,
    action: "approve" | "reject"
  ) => {
    setProcessing(withdrawalId);
    try {
      const response = await fetch("/api/admin/withdrawals/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ withdrawalId, action }),
      });

      if (response.ok) {
        // Refresh the list
        fetchWithdrawals();
        alert(`Withdrawal ${action}d successfully`);
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${action} withdrawal`);
      }
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      alert(`Failed to ${action} withdrawal`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4">Loading withdrawals...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
        <button
          onClick={fetchWithdrawals}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {withdrawals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No pending withdrawal requests</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
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
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {withdrawal.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {withdrawal.userEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      KES {withdrawal.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {withdrawal.phoneNumber}
                    </div>
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
                      {withdrawal.status === "completed" && (
                        <CheckCircle size={12} className="mr-1" />
                      )}
                      {withdrawal.status === "pending" && (
                        <Clock size={12} className="mr-1" />
                      )}
                      {withdrawal.status === "failed" && (
                        <XCircle size={12} className="mr-1" />
                      )}
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {withdrawal.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAction(withdrawal.id, "approve")}
                          disabled={processing === withdrawal.id}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {processing === withdrawal.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(withdrawal.id, "reject")}
                          disabled={processing === withdrawal.id}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {processing === withdrawal.id ? "..." : "Reject"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
