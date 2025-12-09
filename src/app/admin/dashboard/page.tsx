"use client";

import { useState, useEffect } from "react";

interface PaymentStats {
  totalRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

interface RecentPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  planType: string;
  phoneNumber: string;
  user: {
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch("/api/admin/payments");

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentStats(data.data.statistics);
          setRecentPayments(data.data.recentPayments);
        }
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
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
          Welcome back 👋
        </h2>
        <p className="text-gray-500 mt-1">
          Here's your admin dashboard overview.
        </p>
      </section>

      {/* -------------------------------------- */}
      {/* KPI CARDS */}
      {/* -------------------------------------- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DashboardCard icon={<UsersIcon />} title="Total Users" value="2,847" />
        <DashboardCard
          icon={<GlobeIcon />}
          title="Active Sites"
          value="1,234"
        />
        <DashboardCard
          icon={<BarChartIcon />}
          title="Revenue"
          value={
            paymentStats
              ? `KES ${paymentStats.totalRevenue.toLocaleString()}`
              : "KES 0"
          }
        />
        <DashboardCard
          icon={<CreditCardIcon />}
          title="Successful Payments"
          value={
            paymentStats ? paymentStats.successfulPayments.toString() : "0"
          }
        />
      </section>

      {/* -------------------------------------- */}
      {/* TRAFFIC GRAPH */}
      {/* -------------------------------------- */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border mb-10">
        <h3 className="text-lg font-semibold mb-4">Platform Analytics</h3>

        <div className="h-52 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-gray-400">
          <p>Analytics Chart Placeholder</p>
        </div>
      </section>

      {/* -------------------------------------- */}
      {/* PAYMENTS OVERVIEW */}
      {/* -------------------------------------- */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border mb-10">
        <h3 className="text-lg font-semibold mb-4">Payment Overview</h3>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Statistics */}
            {paymentStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {paymentStats.successfulPayments}
                  </div>
                  <div className="text-sm text-green-800">
                    Successful Payments
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {paymentStats.pendingPayments}
                  </div>
                  <div className="text-sm text-yellow-800">
                    Pending Payments
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {paymentStats.failedPayments}
                  </div>
                  <div className="text-sm text-red-800">Failed Payments</div>
                </div>
              </div>
            )}

            {/* Recent Payments */}
            <div>
              <h4 className="font-semibold mb-3">Recent Successful Payments</h4>
              {recentPayments.length === 0 ? (
                <p className="text-gray-500 text-sm">No payments yet</p>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          KES {payment.amount.toLocaleString()} -{" "}
                          {payment.planType}
                        </div>
                        <div className="text-sm text-gray-600">
                          {payment.user?.name || "Unknown User"} •{" "}
                          {payment.phoneNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {payment.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* -------------------------------------- */}
      {/* RECENT ACTIVITY + SIDE CARDS */}
      {/* -------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

          <div className="space-y-5">
            <ActivityItem
              name="New User Registration"
              email="user@example.com"
              time="2 hours ago"
            />
            <ActivityItem
              name="Site Published"
              email="admin@clintonstack.com"
              time="1 day ago"
            />
          </div>
        </div>

        {/* Right-hand stacked cards */}
        <div className="space-y-6">
          <SideCard title="System Status" value="All systems operational" />
          <SideCard title="Server Load" value="45% average" />
          <SideCard title="Database" value="Healthy" />
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
