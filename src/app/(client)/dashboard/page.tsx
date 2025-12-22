import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { usersRepo } from "@/repositories/usersRepo";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect("/auth/login");
  }

  const user = await usersRepo.findById(session.user.id);
  if (!user) {
    redirect("/auth/login");
  }

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (user.role === "affiliate") {
    redirect("/dashboard/affiliate");
  }

  if (user.role === "client") {
    if (!user.onboarded) {
      redirect("/onboarding");
    }
    redirect("/dashboard/niches");
  }

  // Fallback
  redirect("/auth/login");
}
