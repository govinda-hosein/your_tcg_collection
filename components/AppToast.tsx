"use client";

import { useEffect, useRef, useState } from "react";

type AppToastVariant = "success" | "warning" | "info";

interface AppToastProps {
  message: string | null;
  variant?: AppToastVariant;
  positionClassName?: string;
}

const variantClasses: Record<AppToastVariant, string> = {
  success: "border-emerald-700 bg-emerald-600 text-white",
  warning: "border-amber-700 bg-amber-500 text-black",
  info: "border-sky-700 bg-sky-600 text-white",
};

export function AppToast({
  message,
  variant = "success",
  positionClassName = "fixed bottom-4 right-4",
}: AppToastProps) {
  const [renderedMessage, setRenderedMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(
    null,
  );
  const showTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (showTimerRef.current) {
      globalThis.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (hideTimerRef.current) {
      globalThis.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (message) {
      const isFirstShow = renderedMessage === null;
      setRenderedMessage(message);

      if (isFirstShow) {
        setIsVisible(false);
        // Give the browser one tick to paint hidden state before entering.
        showTimerRef.current = globalThis.setTimeout(() => {
          setIsVisible(true);
          showTimerRef.current = null;
        }, 16);
      } else {
        setIsVisible(true);
      }

      return;
    }

    setIsVisible(false);
    hideTimerRef.current = globalThis.setTimeout(() => {
      setRenderedMessage(null);
      hideTimerRef.current = null;
    }, 220);
  }, [message]);

  useEffect(() => {
    return () => {
      if (showTimerRef.current) {
        globalThis.clearTimeout(showTimerRef.current);
      }
      if (hideTimerRef.current) {
        globalThis.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (!renderedMessage) return null;

  return (
    <div className={`${positionClassName} z-50 pointer-events-none`}>
      <div
        className={`rounded-lg border px-4 py-2 text-sm shadow-lg transition-all duration-200 ${
          isVisible
            ? "translate-y-0 opacity-100 ease-out"
            : "translate-y-3 opacity-0 ease-in"
        } ${variantClasses[variant]}`}
      >
        {renderedMessage}
      </div>
    </div>
  );
}
