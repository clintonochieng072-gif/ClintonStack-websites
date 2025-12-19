import { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardSkeleton from "@/components/DashboardSkeleton";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
}
