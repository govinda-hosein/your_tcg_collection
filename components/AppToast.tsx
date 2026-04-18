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
  if (!message) return null;

  return (
    <div className={`${positionClassName} z-50 pointer-events-none`}>
      <div
        className={`rounded-lg border px-4 py-2 text-sm shadow-lg ${variantClasses[variant]}`}
      >
        {message}
      </div>
    </div>
  );
}
