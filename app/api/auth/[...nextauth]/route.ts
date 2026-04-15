import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin",
  },
  callbacks: {
    signIn({ user, profile }) {
      const email = (user.email || profile?.email || "").toLowerCase();
      const allowedAdmins = getAllowedAdminEmails();

      // Only allow sign-in for emails configured in ADMIN_EMAILS.
      return !!email && allowedAdmins.includes(email);
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
