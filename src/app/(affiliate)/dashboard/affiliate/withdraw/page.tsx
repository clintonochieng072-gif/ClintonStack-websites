"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import { getAuthHeaders } from "@/lib/utils";
import AffiliateSidebar from "@/components/AffiliateSidebar";

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

export default function AffiliateWithdrawPage() {
  const { user } = useGlobalContext();
  const router = useRouter();
  const [balance, setBalance] = useState<AffiliateBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mpesaName, setMpesaName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    if (user && user.role === "affiliate") {
      fetchBalance();
    } else if (user && user.role !== "affiliate") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/affiliate/balance", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const balanceData = await response.json();
        setBalance(balanceData);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 300) {
      alert("Please enter a valid withdrawal amount (minimum KES 300)");
      return;
    }
    if (amount > (balance?.availableBalance || 0)) {
      alert("Withdrawal amount cannot exceed available balance");
      return;
    }
    if (!phoneNumber.trim()) {
      alert("Please enter your M-Pesa phone number");
      return;
    }
    if (!mpesaName.trim()) {
      alert("Please enter your MPESA name");
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
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          phoneNumber: phoneNumber.trim(),
          mpesaName: mpesaName.trim(),
        }),
      });

      if (response.ok) {
        alert("Withdrawal request submitted successfully!");
        setPhoneNumber(""); // Clear fields
        setMpesaName("");
        setWithdrawAmount("");
        // Refresh data
        fetchBalance();
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
                  Withdraw Funds
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your withdrawals and balance
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Balance Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Balance
              </h2>
              <Wallet className="w-6 h-6 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">
                      Available Balance
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      KES {balance?.availableBalance || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Ready for withdrawal
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">
                      Total Earned
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      KES {balance?.totalEarned || 0}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      All-time earnings
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Request Withdrawal
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Max: KES ${balance?.availableBalance || 0}`}
                    min="300"
                    max={balance?.availableBalance || 0}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum: KES 300</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712345678 or +254712345678"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Safaricom M-Pesa number for payouts
                  </p>
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
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Name registered with M-Pesa
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">
                      Processing Time
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Withdrawals are typically processed within 1-2 business
                      days. You can only make one withdrawal per day.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                {(balance?.availableBalance || 0) >= 300 ? (
                  <button
                    onClick={handleWithdrawal}
                    disabled={withdrawLoading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200 font-medium"
                  >
                    {withdrawLoading ? "Processing..." : "Withdraw"}
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">
                      Minimum withdrawal: KES 300
                    </p>
                    <p className="text-sm text-gray-400">
                      Earn more commissions to unlock withdrawals
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Withdrawal History */}
          {balance?.withdrawalHistory &&
            balance.withdrawalHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Withdrawal History
                </h2>

                <div className="space-y-4">
                  {balance.withdrawalHistory.map((withdrawal) => (
                    <div
                      key={withdrawal.withdrawalId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {withdrawal.status === "completed" && (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          )}
                          {withdrawal.status === "pending" && (
                            <Clock className="w-8 h-8 text-yellow-600" />
                          )}
                          {withdrawal.status === "failed" && (
                            <XCircle className="w-8 h-8 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            KES {withdrawal.amount} withdrawal
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              withdrawal.requestedAt
                            ).toLocaleDateString()}
                            {withdrawal.phoneNumber &&
                              ` • ${withdrawal.phoneNumber}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
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
                        {withdrawal.processedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(
                              withdrawal.processedAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
