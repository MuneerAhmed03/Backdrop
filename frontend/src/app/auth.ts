import { DefaultSession, getServerSession } from "next-auth";
import { headers } from "next/headers";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id?: string;
//     } & DefaultSession["user"];
//     accessToken?: string;
//   }
// }

export async function auth() {
  const session = await getServerSession({
    callbacks: {
      session: ({ session, token }) => ({
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
        accessToken: token.accessToken,
      }),
    },
  });
  return session;
} 