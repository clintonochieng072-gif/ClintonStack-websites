"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PaymentStats {
  totalRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

interface AffiliateStats {
  totalAffiliates: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  topAffiliate?: {
    name: string;
    earnings: number;
  };
}

interface ClientStats {
  totalClients: number;
  paidClients: number;
  unpaidClients: number;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  phoneNumber: string;
  mpesaName?: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface UnpaidUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(
    null
  );
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<
    WithdrawalRequest[]
  >([]);
  const [unpaidUsers, setUnpaidUsers] = useState<UnpaidUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        paymentsRes,
        affiliatesRes,
        clientsRes,
        withdrawalsRes,
        unpaidRes,
      ] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/admin/affiliates/stats"),
        fetch("/api/admin/clients/stats"),
        fetch("/api/admin/withdrawals?status=pending&limit=5"),
        fetch("/api/admin/payments/unpaid?limit=5"),
      ]);

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        if (data.success) {
          setPaymentStats(data.data.statistics);
        }
      }

      if (affiliatesRes.ok) {
        const data = await affiliatesRes.json();
        setAffiliateStats(data);
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClientStats(data);
      }

      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        setPendingWithdrawals(data.withdrawals || []);
      }

      if (unpaidRes.ok) {
        const data = await unpaidRes.json();
        setUnpaidUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 w-full">
      {/* -------------------------------------- */}
      {/* WELCOME SECTION */}
      {/* -------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-3xl font-semibold tracking-tight">
          Admin Manager Dashboard 👋
        </h2>
        <p className="text-gray-500 mt-1">
          Manage affiliates, clients, payments, and withdrawals.
        </p>
      </section>

      {/* -------------------------------------- */}
      {/* KPI CARDS */}
      {/* -------------------------------------- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DashboardCard
          icon={<UsersIcon />}
          title="Total Affiliates"
          value={affiliateStats?.totalAffiliates?.toString() || "0"}
        />
        <DashboardCard
          icon={<UsersIcon />}
          title="Total Clients"
          value={clientStats?.totalClients?.toString() || "0"}
        />
        <DashboardCard
          icon={<BarChartIcon />}
          title="Total Earnings"
          value={`KES ${(affiliateStats?.totalEarnings || 0).toLocaleString()}`}
        />
        <DashboardCard
          icon={<CreditCardIcon />}
          title="Pending Withdrawals"
          value={affiliateStats?.pendingWithdrawals?.toString() || "0"}
        />
      </section>

      {/* -------------------------------------- */}
      {/* QUICK ACTIONS */}
      {/* -------------------------------------- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Link href="/admin/withdrawals" className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
              <CreditCardIcon />
            </div>
            <div>
              <p className="font-semibold">Pending Withdrawals</p>
              <p className="text-sm text-gray-500">Approve or deny requests</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/payments" className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <CreditCardIcon />
            </div>
            <div>
              <p className="font-semibold">Manual Payments</p>
              <p className="text-sm text-gray-500">Approve unpaid users</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/affiliates" className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <UsersIcon />
            </div>
            <div>
              <p className="font-semibold">All Affiliates</p>
              <p className="text-sm text-gray-500">Manage affiliate accounts</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/clients" className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <UsersIcon />
            </div>
            <div>
              <p className="font-semibold">All Clients</p>
              <p className="text-sm text-gray-500">Manage client accounts</p>
            </div>
          </div>
        </Link>
      </section>

      {/* -------------------------------------- */}
      {/* PENDING WITHDRAWALS & MANUAL PAYMENTS */}
      {/* -------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Pending Withdrawals */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pending Withdrawals</h3>
            <Link href="/admin/withdrawals" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : pendingWithdrawals.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending withdrawals</p>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.slice(0, 3).map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      KES {withdrawal.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {withdrawal.user.name} • {withdrawal.phoneNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {withdrawal.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Payment Approvals */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Manual Payment Approvals</h3>
            <Link href="/admin/payments" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : unpaidUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No unpaid users</p>
          ) : (
            <div className="space-y-3">
              {unpaidUsers.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Unpaid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------- */}
      {/* ANALYTICS & TOP PERFORMERS */}
      {/* -------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Analytics Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Analytics Summary</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {clientStats?.paidClients || 0}
              </div>
              <div className="text-sm text-green-800">Paid Clients</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {clientStats?.unpaidClients || 0}
              </div>
              <div className="text-sm text-yellow-800">Unpaid Clients</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {affiliateStats?.topAffiliate ? `KES ${affiliateStats.topAffiliate.earnings.toLocaleString()}` : "N/A"}
              </div>
              <div className="text-sm text-blue-800">Top Affiliate Earnings</div>
            </div>
          </div>
        </div>

        {/* Top Affiliate */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Top Performer</h3>

          {affiliateStats?.topAffiliate ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UsersIcon />
              </div>
              <div className="font-semibold">{affiliateStats.topAffiliate.name}</div>
              <div className="text-sm text-gray-600">
                KES {affiliateStats.topAffiliate.earnings.toLocaleString()} earned
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <UsersIcon />
              <p className="mt-2">No data yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// --------------------------------------------------------------
// COMPONENTS
// --------------------------------------------------------------

function DashboardCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all">
      <div className="p-3 bg-blue-50 rounded-xl text-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({
  name,
  email,
  time,
}: {
  name: string;
  email: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
      <span className="text-sm text-gray-400">{time}</span>
    </div>
  );
}

function SideCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}

// Icon components
function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
