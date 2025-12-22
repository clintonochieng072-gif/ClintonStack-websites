import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { usersRepo } from "@/repositories/usersRepo";
import { redirect } from "next/navigation";
import OnboardingNichesClient from "./OnboardingNichesClient";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect("/auth/login");
  }

  const user = await usersRepo.findById(session.user.id);
  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "client" || user.onboarded) {
    redirect("/dashboard");
  }

  return <OnboardingNichesClient />;
}
