'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, User, LogIn } from "lucide-react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button disabled className="glassmorphism h-9 px-3 rounded-lg">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <div className="glassmorphism flex items-center gap-2 px-3 py-1.5 rounded-lg">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-6 h-6 rounded-full ring-1 ring-white/20"
            />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm text-primary">{session.user?.name?.split(' ')[0]}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="glassmorphism h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent/50 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 text-primary" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="glassmorphism h-9 px-4 rounded-lg flex items-center gap-2 hover:bg-accent/50 transition-colors"
    >
      <span className="text-primary">Sign in</span>
    </button>
  );
} 