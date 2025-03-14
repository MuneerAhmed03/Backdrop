'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="outline" className="neo-blur w-[100px] cursor-wait" disabled>
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </Button>
    );
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="neo-blur relative group pr-8"
          >
            <div className="flex items-center gap-2">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-6 h-6 rounded-full ring-1 ring-white/20 transition-transform group-hover:scale-110"
                />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-primary">
                {session.user?.name?.split(' ')[0]}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 transition-transform group-hover:rotate-180" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-sm text-muted-foreground">
            Signed in as {session.user?.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => signOut()}
            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={() => signIn("google")}
      variant="outline"
      className="neo-blur group relative overflow-hidden"
    >
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
        <span className="text-primary font-medium">Sign in</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
    </Button>
  );
} 