'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, User, LogIn } from "lucide-react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button disabled className="btn-ghost h-9 px-3">
        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" />
      </button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[var(--card-hover)]">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-[var(--foreground-subtle)]" />
          )}
          <span className="text-sm">{session.user?.name?.split(' ')[0]}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="btn-ghost h-8 w-8 p-0 flex items-center justify-center hover:bg-[var(--card-hover)]"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="btn-secondary h-9 px-4 flex items-center gap-2"
    >
      <LogIn className="w-4 h-4" />
      <span>Sign in</span>
    </button>
  );
} 