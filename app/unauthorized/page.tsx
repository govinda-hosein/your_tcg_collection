import { ShieldX } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen relative overflow-hidden px-4 py-8">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border-2 border-border bg-card/90 shadow-lg backdrop-blur-sm p-6 sm:p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
            <ShieldX className="w-6 h-6" />
          </div>

          <h1
            className="text-2xl tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Unauthorized
          </h1>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access this page.
          </p>

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-border hover:bg-muted transition-colors duration-200"
              style={{ fontFamily: "var(--font-display)" }}
            >
              HOME
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
