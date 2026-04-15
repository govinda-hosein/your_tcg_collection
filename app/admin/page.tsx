"use client";

import { ArrowLeft, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AdminLoginContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  return (
    <main className="min-h-screen relative overflow-hidden px-4 py-8">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border
                   bg-card/90 text-foreground shadow-md backdrop-blur-sm hover:bg-muted
                   transition-colors duration-200"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back Home
        </Link>
      </div>

      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border-2 border-border bg-card/90 shadow-lg backdrop-blur-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1
                className="text-2xl tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Admin Access
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in with an authorized Google account
              </p>
            </div>
          </div>

          {authError ? (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Access denied. Only configured admin email addresses can sign in.
            </div>
          ) : null}

          {session ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                Welcome, {session.user?.name || session.user?.email || "Admin"}!
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/admin" })}
                className="w-full px-5 py-3 bg-destructive text-destructive-foreground rounded-lg
                         flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]
                         transition-transform duration-200"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <LogOut className="w-5 h-5" />
                SIGN OUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/admin" })}
              className="w-full px-5 py-3 bg-primary text-primary-foreground rounded-lg
                       flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]
                       transition-transform duration-200"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <LogIn className="w-5 h-5" />
              CONTINUE WITH GOOGLE
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <SessionProvider>
      <AdminLoginContent />
    </SessionProvider>
  );
}
