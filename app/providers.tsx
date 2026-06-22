"use client";

import { FeatureFlagsProvider } from "@/components/FeatureFlagsProvider";
import type { FeatureFlags } from "@/lib/featureFlags.config";
import { withBasePath } from "@/lib/url";
import { SessionProvider } from "next-auth/react";

export function Providers({
  children,
  initialFeatureFlags,
}: {
  children: React.ReactNode;
  initialFeatureFlags: FeatureFlags;
}) {
  return (
    <SessionProvider basePath={withBasePath("/api/auth")}>
      <FeatureFlagsProvider initialFlags={initialFeatureFlags}>
        {children}
      </FeatureFlagsProvider>
    </SessionProvider>
  );
}
