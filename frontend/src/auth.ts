import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    idToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
  }
}

const BACKEND_URL = process.env.BACKEND_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = (account as any).access_token as string | undefined;
        token.idToken = (account as any).id_token as string | undefined;
      }
      return token as JWT;
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).idToken;
      (session as any).idToken = (token as any).idToken;
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const response = await fetch(`${BACKEND_URL}auth/create-user/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${(account as any).id_token}`,
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              provider: "google",
              providerId: (profile as any)?.sub,
            }),
          });

          if (!response.ok) {
            console.error("Failed to create user");
            return false;
          }

          return true;
        } catch (error) {
          console.error("Error creating user:", error);
          return false;
        }
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

