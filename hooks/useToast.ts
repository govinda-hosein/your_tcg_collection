"use client";

import { useEffect, useRef, useState } from "react";

export function useToast(defaultDurationMs = 1700) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(
    null,
  );

  const clearToast = () => {
    if (timeoutRef.current) {
      globalThis.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMessage(null);
  };

  const showToast = (nextMessage: string, durationMs = defaultDurationMs) => {
    if (timeoutRef.current) {
      globalThis.clearTimeout(timeoutRef.current);
    }

    setMessage(nextMessage);
    timeoutRef.current = globalThis.setTimeout(() => {
      setMessage(null);
      timeoutRef.current = null;
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        globalThis.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    toastMessage: message,
    showToast,
    clearToast,
  };
}
