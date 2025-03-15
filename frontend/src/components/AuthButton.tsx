'use client'

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, User, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AuthButtonProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  customMessage?: string;
}

export function AuthButton({ isOpen: propIsOpen, onClose, onOpen, customMessage }: AuthButtonProps) {
  const { data: session, status } = useSession();
  const [isLocalSignInDialogOpen, setIsLocalSignInDialogOpen] = useState(false);
  
  const isSignInDialogOpen = propIsOpen !== undefined ? propIsOpen : isLocalSignInDialogOpen;
  const handleClose = onClose || (() => setIsLocalSignInDialogOpen(false));
  const handleOpen = onOpen || (() => setIsLocalSignInDialogOpen(true));

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
                <User className="w-5 h-5 text-muted-foreground" />
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
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        className="neo-blur group relative overflow-hidden"
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
          <span className="text-primary font-medium">Sign in</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
      </Button>

      <Dialog open={isSignInDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px] glassmorphism border-white/20 backdrop-blur-2xl p-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-blue-400/5 to-blue-600/10 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="pt-6 pb-2 px-6">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-semibold bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 bg-clip-text text-transparent">
                  Welcome to Backdrop
                </DialogTitle>
                <div className="mt-3 mx-auto w-12 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-70" />
              </DialogHeader>
            </div>

            <div className="flex flex-col items-center gap-6 py-6 px-6">
              {customMessage ? (
                <p className="text-center text-muted-foreground">
                  {customMessage}
                </p>
              ) : (
                <p className="text-center text-muted-foreground">
                  Sign in to save and manage your custom strategies
                </p>
              )}
              
              <Button
                onClick={() => signIn("google")}
                variant="outline"
                className="w-full max-w-sm flex items-center justify-center gap-3 py-6 bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-[0_8px_24px_-12px_rgba(0,118,255,0.3)] transition-all duration-300 group"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-110">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                <span className="font-medium">Continue with Google</span>
              </Button>
              
              <div className="w-full flex items-center gap-3 mt-2">
                <div className="h-px bg-white/10 flex-grow"></div>
                <div className="h-px bg-white/10 flex-grow"></div>
              </div>
              
              
            </div>

            <DialogFooter className="px-6 pb-6 pt-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full hover:bg-white/[0.05] text-muted-foreground hover:text-white transition-colors"
              >
                Maybe Later
              </Button>
            </DialogFooter>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none" />
        </DialogContent>
      </Dialog>
    </>
  );
}