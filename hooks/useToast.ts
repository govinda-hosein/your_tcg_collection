"use client";

import { useEffect, useRef, useState } from "react";

export function useToast(defaultDurationMs = 1700) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const clearToast = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMessage(null);
  };

  const showToast = (nextMessage: string, durationMs = defaultDurationMs) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setMessage(nextMessage);
    timeoutRef.current = window.setTimeout(() => {
      setMessage(null);
      timeoutRef.current = null;
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    toastMessage: message,
    showToast,
    clearToast,
  };
}
