"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/**
 * Minimal callback page shown after OAuth redirect.
 * Better Auth automatically handles the token exchange at /api/auth/callback/[provider].
 * This page just waits for the session to be ready, then redirects by role.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  React.useEffect(() => {
    if (!isPending && session) {
      const role = (session.user as { role?: string }).role;
      router.replace(role === "admin" ? "/admin" : "/learn/dsa");
    } else if (!isPending && !session) {
      // Something went wrong — fall back to login
      router.replace("/login");
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
      <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
        Authenticating...
      </p>
    </div>
  );
}
