"use client";

import {
  DEFAULT_FEATURE_FLAGS,
  FeatureFlagName,
  FeatureFlags,
} from "@/lib/featureFlags.config";
import { createContext, useContext, useMemo } from "react";

type FeatureFlagsContextValue = {
  flags: FeatureFlags;
  isEnabled: (name: FeatureFlagName) => boolean;
};

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(
  null,
);

export function FeatureFlagsProvider({
  children,
  initialFlags,
}: {
  children: React.ReactNode;
  initialFlags: FeatureFlags;
}) {
  const value = useMemo<FeatureFlagsContextValue>(() => {
    const mergedFlags: FeatureFlags = {
      ...DEFAULT_FEATURE_FLAGS,
      ...initialFlags,
    };

    return {
      flags: mergedFlags,
      isEnabled: (name: FeatureFlagName) => mergedFlags[name],
    };
  }, [initialFlags]);

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    return {
      flags: DEFAULT_FEATURE_FLAGS,
      isEnabled: (name: FeatureFlagName) => DEFAULT_FEATURE_FLAGS[name],
    };
  }

  return context;
}
