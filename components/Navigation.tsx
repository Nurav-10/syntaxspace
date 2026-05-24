"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Search01Icon,
  DatabaseIcon,
  Settings02Icon,
  WorkflowSquare01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { useSearchStore } from "@/lib/search-store";
import Image from "next/image";

type NavUser = {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
};

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user as NavUser | undefined;
  const isAdmin = user?.role === "admin";

  const setSearchOpen = useSearchStore((s) => s.setIsOpen);
  const fetchSearchIndex = useSearchStore((s) => s.fetchSearchIndex);

  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    router.push("/login");
  };

  const navItems = [
    {
      name: "DSA",
      href: "/learn/dsa/introduction-to-data-structures-and-algorithm",
      icon: BookOpen01Icon,
    },
    {
      name: "System Design",
      href: "/learn/system-design/introduction-to-system-design",
      icon: WorkflowSquare01Icon,
    },
    {
      name: "OOPs",
      href: "/learn/oops/introduction-to-object-oriented-programming",
      icon: Settings02Icon,
    },
    {
      name: "SQL",
      href: "/learn/sql/introduction-to-sql-and-database",
      icon: DatabaseIcon,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo + Nav Tracks */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/ss-logo.svg"
              width={100}
              height={100}
              className="w-5 h-5 dark:invert"
              alt="website-logo"
            />
            <span className="font-mono text-sm font-bold tracking-tight text-foreground sm:block">
              SYNTAX
              <span className="font-sans font-light text-muted-foreground">
                SPACE
              </span>
            </span>
          </Link>

          {/* Navigation Tracks */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(
                item.href.split("/").slice(0, 3).join("/"),
              );
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "text-foreground bg-accent/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/20",
                  )}
                >
                  <HugeiconsIcon icon={item.icon} className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden sm:block w-48 md:w-56">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search content..."
              className="w-full h-8 rounded-md border border-border bg-muted/30 pl-8 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-border transition-all cursor-pointer"
              readOnly
              onClick={() => {
                setSearchOpen(true);
                fetchSearchIndex();
              }}
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none select-none rounded border border-border bg-muted p-1 text-[9px] font-medium text-muted-foreground leading-none">
              ⌘K
            </kbd>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="w-px h-5 bg-border" />

          {/* Auth Section */}
          {isPending ? (
            /* Loading skeleton */
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : !user ? (
            /* Not logged in → Sign In button */
            <Link
              href="/login"
              className="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              Sign In
            </Link>
          ) : (
            /* Logged in → Profile dropdown */
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 hover:bg-accent/20 transition-colors"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-6 w-6 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-black text-muted-foreground uppercase">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
                {/* Name (hidden on small screens) */}
                <span className="hidden sm:block text-xs font-semibold text-foreground max-w-[90px] truncate">
                  {user.name?.split(" ")[0]}
                </span>
                {/* Caret */}
                <svg
                  className={cn(
                    "h-3 w-3 text-muted-foreground transition-transform duration-200",
                    profileOpen && "rotate-180",
                  )}
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {/* Dropdown Panel */}
              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-60 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-150">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-border/60 flex items-center gap-3">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-9 w-9 rounded-full border border-border object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-black text-muted-foreground uppercase shrink-0">
                        {user.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {user.name || "User"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <span
                        className={cn(
                          "inline-block mt-0.5 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full",
                          isAdmin
                            ? "bg-foreground/10 text-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {user.role || "user"}
                      </span>
                    </div>
                  </div>

                  {/* Admin-only actions */}
                  {isAdmin && (
                    <div className="px-2 py-1.5 border-b border-border/60">
                      <p className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Admin
                      </p>
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-accent/30 transition-colors"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                        Admin Console
                      </Link>
                      <Link
                        href="/dashboard/create"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-accent/30 transition-colors"
                      >
                        <HugeiconsIcon
                          icon={PlusSignIcon}
                          className="h-3.5 w-3.5 text-muted-foreground"
                        />
                        Create Content
                      </Link>
                    </div>
                  )}

                  {/* Sign Out */}
                  <div className="px-2 py-1.5">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
