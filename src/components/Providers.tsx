"use client";

import { SessionProvider } from "next-auth/react";
import GlobalProvider from "@/context/GlobalContext";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <GlobalProvider>{children}</GlobalProvider>
    </SessionProvider>
  );
}
