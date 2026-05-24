"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/lib/auth-client";
import Image from "next/image";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loadingProvider, setLoadingProvider] = React.useState<
    "google" | "github" | null
  >(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isPending && session) {
      const role = (session.user as { role?: string }).role;
      router.replace(role === "admin" ? "/admin" : "/learn/dsa");
    }
  }, [session, isPending, router]);

  const handleOAuth = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/auth/callback",
      });
    } catch {
      setLoadingProvider(null);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
          <span className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden select-none">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/4 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-500/4 blur-3xl" />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center mb-10 z-10">
        <Image
          src="/ss-logo.svg"
          width={100}
          height={100}
          alt="website-logo"
          className="dark:invert w-5 h-5"
        />
        <span className="font-mono text-base font-bold tracking-tight text-foreground">
          SYNTAX
          <span className="font-sans font-light text-muted-foreground">
            SPACE
          </span>
        </span>
      </Link>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Header */}
        <div className="px-7 pt-7 pb-5 text-center">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Sign in to SyntaxSpace
          </h1>
          <p className="text-xs text-muted-foreground mt-2 font-light leading-relaxed max-w-xs mx-auto">
            Continue with your Google or GitHub account. Your profile is created
            automatically.
          </p>
        </div>

        {/* Divider */}
        <div className="mx-7 border-t border-border/60" />

        {/* OAuth Buttons */}
        <div className="px-7 py-6 space-y-3">
          {/* Google */}
          <button
            id="login-google"
            onClick={() => handleOAuth("google")}
            disabled={loadingProvider !== null}
            className="group w-full h-11 rounded-xl border border-border bg-background hover:bg-muted/40 flex items-center justify-center gap-3 text-sm font-semibold text-foreground transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {loadingProvider === "google" ? (
              <div className="h-4 w-4 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span>Continue with Google</span>
            {loadingProvider !== "google" && (
              <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground text-xs">
                →
              </span>
            )}
          </button>

          {/* GitHub */}
          <button
            id="login-github"
            onClick={() => handleOAuth("github")}
            disabled={loadingProvider !== null}
            className="group w-full h-11 rounded-xl border border-border bg-foreground text-background hover:bg-foreground/90 flex items-center justify-center gap-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {loadingProvider === "github" ? (
              <div className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
            ) : (
              <GitHubIcon />
            )}
            <span>Continue with GitHub</span>
            {loadingProvider !== "github" && (
              <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-background/60 text-xs">
                →
              </span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-7 pb-6 text-center">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            By continuing, you agree to SyntaxSpace&apos;s{" "}
            <span className="text-foreground/70 underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-foreground/70 underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
