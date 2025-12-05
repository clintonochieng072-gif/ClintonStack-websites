"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Bell,
  Eye,
  CloudLightning,
  Server,
  Users,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { getBaseUrl, getAuthHeaders } from "@/lib/utils";

// ===========================
// Premium Admin Dashboard
// Place this file: src/components/admin/PremiumDashboard.tsx
// Usage: import PremiumDashboard from '@/components/admin/PremiumDashboard'
// Render in your admin route and pass `site`, `stats`, `activities` props
// Dependencies: shadcn/ui, lucide-react, recharts
// ===========================

const sampleTraffic = [
  { name: "Mon", uv: 120 },
  { name: "Tue", uv: 210 },
  { name: "Wed", uv: 150 },
  { name: "Thu", uv: 320 },
  { name: "Fri", uv: 280 },
  { name: "Sat", uv: 400 },
  { name: "Sun", uv: 360 },
];

export default function PremiumDashboard({
  site = {
    _id: "",
    name: "Acme Consulting",
    slug: "acme-consulting",
    status: "Online",
    screenshot: "/placeholder-site.png",
    plan: "Pro",
  },
  stats = {
    visitors: 1234,
    leads: 56,
    score: 92,
    uptime: "99.98%",
  },
  activities = [
    {
      id: 1,
      type: "lead",
      title: "John Doe",
      meta: "john@example.com",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "message",
      title: "Jane Smith",
      meta: "jane@example.com",
      time: "1 day ago",
    },
  ],
}) {
  const router = useRouter();
  const publicUrl = `${getBaseUrl()}/site/${site.slug}`;

  const handlePreview = () => {
    window.open(`/preview/${site.slug}`, "_blank");
  };

  const handlePublish = async () => {
    try {
      const response = await fetch("/api/site/publish", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ siteId: site._id }),
      });

      if (response.ok) {
        alert("Site published successfully!");
        window.open(publicUrl, "_blank");
      } else {
        alert("Failed to publish site");
      }
    } catch (error) {
      alert("Error publishing site");
    }
  };

  const handleEditWebsite = () => {
    router.push("/edit");
  };

  const handleAddProperty = () => {
    router.push("/edit/properties-manager");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      alert("Website URL copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Website URL copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-extrabold text-sky-600">
            ClintonStack
          </div>
          <div className="hidden md:block">
            <Input
              placeholder="Search sites, users, templates..."
              className="w-[420px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={handlePreview}
          >
            <Eye size={16} /> Preview
          </Button>

          <Button
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white"
            onClick={handlePublish}
          >
            Publish
          </Button>

          <button className="p-2 rounded-md hover:bg-slate-100">
            <Bell size={18} />
          </button>

          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/avatar.jpg" alt="User avatar" />
              <AvatarFallback>CS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-10">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3">
            <Card className="sticky top-6">
              <CardContent>
                <div className="flex items-center gap-3">
                  <img
                    src={site.screenshot}
                    alt="site"
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <div className="font-semibold">{site.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {site.plan} • {site.status}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 w-full text-left"
                    onClick={() => router.push("/edit")}
                  >
                    <div className="flex items-center gap-3">
                      <Server size={18} />
                      <div>Website Builder</div>
                    </div>
                    <MoreHorizontal size={16} />
                  </button>

                  <button
                    className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 w-full text-left"
                    onClick={() => router.push("/edit/properties-manager")}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={18} />
                      <div>Properties Manager</div>
                    </div>
                    <MoreHorizontal size={16} />
                  </button>

                  <button
                    className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 w-full text-left"
                    onClick={() => router.push("/edit/media-library")}
                  >
                    <div className="flex items-center gap-3">
                      <CloudLightning size={18} />
                      <div>Media Library</div>
                    </div>
                    <MoreHorizontal size={16} />
                  </button>

                  <button
                    className="flex items-center justify-between p-3 rounded-md hover:bg-slate-50 w-full text-left"
                    onClick={() => router.push("/edit/settings-main")}
                  >
                    <div className="flex items-center gap-3">
                      <MoreHorizontal size={18} />
                      <div>Settings</div>
                    </div>
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Website Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.score}%</div>
                    <div className="text-sm text-muted-foreground">
                      Performance score
                    </div>
                  </div>
                  <Badge variant="secondary">Pro Tip</Badge>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Uptime: <strong>{stats.uptime}</strong>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <section className="col-span-12 lg:col-span-9">
            {/* Hero quick actions */}
            <div className="rounded-2xl bg-gradient-to-r from-white via-sky-50 to-indigo-50 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 rounded-md overflow-hidden shadow-sm">
                    <img
                      src={site.screenshot}
                      alt="s"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold">Welcome back</div>
                    <div className="text-sm text-muted-foreground">
                      Manage your website and track performance
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button className="px-4 py-2" onClick={handleEditWebsite}>
                    Edit Website
                  </Button>
                  <Button variant="outline" onClick={handleAddProperty}>
                    Add Property
                  </Button>
                  <Button variant="ghost" onClick={handleCopyLink}>
                    Copy Website Link
                  </Button>
                </div>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Visitors this month
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.visitors.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-md">
                    <Users size={20} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Leads received
                    </div>
                    <div className="text-2xl font-bold">{stats.leads}</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-md">
                    <MoreHorizontal size={20} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Website status
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {site.status}
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-md">
                    <CloudLightning size={20} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Traffic + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Traffic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sampleTraffic}>
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="uv"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-start justify-between"
                      >
                        <div>
                          <div className="font-semibold">{a.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {a.meta}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {a.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer area: deeper metrics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Meta completeness: <strong>87%</strong>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hosting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>Provider: Vercel</div>
                  <div>
                    Edge: <strong>Enabled</strong>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    Plan: <strong>{site.plan}</strong>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
