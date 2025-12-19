"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  payments: {
    amount: number;
    paymentMethod: string;
  }[];
}

export default function AdminPaymentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<{ [userId: string]: number }>({});

  useEffect(() => {
    fetchUnpaidUsers();
  }, []);

  const fetchUnpaidUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/payments/unpaid");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        // Initialize amounts with latest payment or default
        const initialAmounts: { [userId: string]: number } = {};
        data.users.forEach((user: User) => {
          initialAmounts[user.id] = user.payments[0]?.amount || 999; // Default to 999 KES
        });
        setAmounts(initialAmounts);
      } else {
        setError("Failed to fetch unpaid users");
      }
    } catch (error) {
      console.error("Error fetching unpaid users:", error);
      setError("Failed to fetch unpaid users");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    const amount = amounts[userId] || 0;
    if (!confirm("Are you sure you want to approve this payment?")) {
      return;
    }

    try {
      setApproving(userId);
      const response = await fetch("/api/admin/payments/unpaid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
        }),
      });

      if (response.ok) {
        // Remove the user from the list
        setUsers(users.filter((user) => user.id !== userId));
        alert("Payment approved successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to approve payment: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment");
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Manual Payment Approvals
        </h1>
        <p className="text-gray-500 mt-1">
          Review and approve manual payments for users.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Unpaid Users ({users.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No unpaid users found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user) => {
              const latestPayment = user.payments[0];
              return (
                <div
                  key={user.id}
                  className="p-6 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount (KES)
                        </label>
                        <input
                          type="number"
                          value={amounts[user.id] || 0}
                          onChange={(e) =>
                            setAmounts({
                              ...amounts,
                              [user.id]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>

                      {latestPayment && (
                        <div className="text-sm text-gray-600">
                          <div>
                            Previous: KES{" "}
                            {latestPayment.amount.toLocaleString()}
                          </div>
                          <div className="capitalize">
                            {latestPayment.paymentMethod}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Unpaid
                      </span>

                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={approving === user.id}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approving === user.id ? "Approving..." : "Approve"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
