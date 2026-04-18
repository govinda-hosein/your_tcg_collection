"use client";

import { withBasePath } from "@/lib/url";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath={withBasePath("/api/auth")}>
      {children}
    </SessionProvider>
  );
}
