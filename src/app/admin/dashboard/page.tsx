export default function AdminDashboard() {
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
          value="$12,847"
        />
        <DashboardCard icon={<ShieldIcon />} title="Reports" value="23" />
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
