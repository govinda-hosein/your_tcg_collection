import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // Keep the admin login page publicly accessible.
    if (pathname === "/admin") {
      return NextResponse.next();
    }

    const token = req.nextauth.token;
    if (token) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl.clone();
    url.pathname = "/unauthorized";
    url.search = "";
    return NextResponse.rewrite(url);
  },
  {
    callbacks: {
      // Always run through our custom middleware logic above.
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: ["/add/:path*", "/admin/:path*", "/api/admin/:path*"],
};
