interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Loading Collection...",
}: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
        <p
          className="text-muted-foreground text-sm tracking-widest uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
