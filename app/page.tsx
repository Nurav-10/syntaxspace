"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  DatabaseIcon,
  WorkflowSquare01Icon,
  Settings02Icon,
  CodeIcon,
  FolderIcon,
  TaskIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { SQLPlayground } from "@/components/mdx/SQLPlayground";

export default function Home() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string } | undefined;
  const isAdmin = user?.role === "admin";

  const tracks = [
    {
      title: "Data Structures & Algorithms",
      desc: "Analyze and implement core sorting techniques like Quick Sort, Merge Sort, and Heap Sort with real-time dynamic traces.",
      href: "/learn/dsa/introduction-to-data-structures-and-algorithm",
      icon: BookOpen01Icon,
      slug: "dsa",
    },
    {
      title: "Distributed System Design",
      desc: "Learn to build distributed rate limiters, load balancers, caching layers, database sharding, and edge API architectures.",
      href: "/learn/system-design/introduction-to-system-design",
      icon: WorkflowSquare01Icon,
      slug: "system-design",
    },
    {
      title: "Object-Oriented Programming",
      desc: "Decouple software structures using polymorphism, method overrides, solid principles, and clean interfaces.",
      href: "/learn/oops/introduction-to-object-oriented-programming",
      icon: Settings02Icon,
      slug: "oops",
    },
    {
      title: "SQL Mastery & Database Joins",
      desc: "Master relational schema querying, indexing optimization, subqueries, and compound inner/outer joins in an interactive playground.",
      href: "/learn/sql/introduction-to-sql-and-database",
      icon: DatabaseIcon,
      slug: "sql",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Sleek Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all select-none">
        <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/ss-logo.svg"
              width={100}
              height={100}
              alt="website-logo"
              className="dark:invert w-5 h-5"
            />
            <span className="font-mono font-bold tracking-tight">
              SYNTAX
              <span className="font-sans font-light text-muted-foreground">
                SPACE
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mr-2"
              >
                Admin Panel
              </Link>
            )}
            <Link
              href="/learn/dsa/introduction-to-data-structures-and-algorithm"
              className="h-8 rounded bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 flex items-center justify-center transition-colors"
            >
              Start Learning
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border select-none">
        {/* Abstract grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/30 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <HugeiconsIcon icon={CodeIcon} className="h-3 w-3" />
            Vercel-Inspired Learning Console
          </span>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] text-foreground font-sans">
            High-Performance Learning <br className="hidden sm:inline" />
            Tailored for Modern Developers.
          </h1>

          <p className="md:text-base text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
            SyntaxSpace hosts comprehensive interactive breakdowns of Data
            Structures, System Design, SQL, and OOPs—complete with live,
            in-browser visual sandboxes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center font-semibold gap-3">
            <Link
              href="/learn/dsa/syllabus-of-data-structure-and-algorithms"
              className="w-full sm:w-auto h-10 rounded-md bg-foreground px-6 text-sm  text-background hover:bg-foreground/90 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Explore Syllabus</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </Link>
            <Link
              href={!user ? "/login" : "/learn/dsa"}
              className="w-full sm:w-auto h-10 rounded-md border border-border bg-card px-6 text-sm  text-foreground hover:bg-accent transition-all flex items-center justify-center"
            >
              {!user ? "Login" : "Get Started"}
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Core Tracks Grid */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12">
        <div className="text-left select-none">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">
            Syllabus Directory
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-1">
            Four Columns of Technical Mastery
          </h2>
          <p className="text-left text-muted-foreground font-light mt-1.5 max-w-md leading-relaxed">
            Click on any card to dive directly into the fully compiled learning
            modules, containing embedded widgets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
          {tracks.map((track) => (
            <Link
              key={track.slug}
              href={track.href}
              className="group border border-border rounded-xl bg-card p-6 hover:border-foreground/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-foreground group-hover:bg-foreground/70 group-hover:text-background transition-all">
                  <HugeiconsIcon icon={track.icon} className="h-4 w-4" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-foreground group-hover:underline leading-tight">
                    {track.title}
                  </h3>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {track.desc}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors pt-4 border-t border-border/40">
                <span>Start Module</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="h-3 w-3 group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Interactive SQL Playground Showcase */}
      <section className="border-t border-border bg-muted/10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-border bg-background text-[10px] font-bold text-foreground font-mono uppercase tracking-wider">
                Live In-Browser Sandbox
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono uppercase tracking-wider animate-pulse">
                Coming Soon
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground font-sans mt-3">
              Experience the Relational Database Engine.
            </h2>
            <p className="text-muted-foreground font-light mt-2 leading-relaxed">
              No setup required. Write real relational SQL select statements,
              execute inner/outer joins, and observe stats directly in the
              interactive compiler below.
            </p>
          </div>

          <div className="max-w-5xl mx-auto select-text">
            <SQLPlayground />
          </div>
        </div>
      </section>

      {/* Admin Panel Feature Highlight */}
      <section className="border-t border-border bg-muted/5 py-16 md:py-24 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-border bg-background text-xs font-bold text-foreground font-mono">
              STUDIO DESK
            </span>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground font-sans">
              Local File Writing & <br className="hidden sm:inline" />
              Markdown drag-and-drop.
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed">
              We built a fully integrated **Admin Dashboard** supporting dynamic
              uploads. Drop existing `.mdx` documents inside the upload panel,
              edit metadata tags, and persist files locally to disk.
            </p>

            <ul className="space-y-3.5 text-sm text-muted-foreground font-light">
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FolderIcon}
                  className="h-4 w-4 text-foreground shrink-0"
                />
                <span>
                  **Local File System API**: Writes files to the content folder
                  instantly in dev mode.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={TaskIcon}
                  className="h-4 w-4 text-foreground shrink-0"
                />
                <span>
                  **Split-Pane Live Preview**: Previews interactive widgets in
                  real-time as you write.
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href={
                  !user
                    ? "/login"
                    : "/learn/dsa/syllabus-of-data-structure-and-algortihms"
                }
                className="inline-flex h-9 rounded-md bg-foreground px-5 text-sm font-semibold text-background hover:bg-foreground/90 items-center justify-center transition-colors"
              >
                {!user ? "Login" : "Get Started"}
              </Link>
            </div>
          </div>

          {/* Visual mock showing Vercel dashboard visual aesthetics */}
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xl p-5 font-mono text-xs text-muted-foreground space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-foreground">
                  API status: ONLINE
                </span>
              </div>
              <span>POST /api/admin/save</span>
            </div>

            <div className="bg-black text-zinc-300 p-4 rounded-lg space-y-1">
              <p>
                <span className="text-zinc-500">1</span>{" "}
                <span className="text-yellow-500">const</span> payload = {"{"}
              </p>
              <p>
                <span className="text-zinc-500">2</span> title:{" "}
                <span className="text-emerald-400">
                  {'"Sorting Algorithms Analyzed"'}
                </span>
                ,
              </p>
              <p>
                <span className="text-zinc-500">3</span> track:{" "}
                <span className="text-emerald-400">{'"dsa"'}</span>,
              </p>
              <p>
                <span className="text-zinc-500">4</span> slug:{" "}
                <span className="text-emerald-400">
                  {'"sorting-algorithms"'}
                </span>
              </p>
              <p>
                <span className="text-zinc-500">5</span> {"};"}
              </p>
              <p>
                <span className="text-zinc-500">6</span>{" "}
              </p>
              <p>
                <span className="text-zinc-500">7</span>{" "}
                <span className="text-zinc-500">
                  {"// File successfully written directly to:"}
                </span>
              </p>
              <p>
                <span className="text-zinc-500">8</span>{" "}
                <span className="text-emerald-500">
                  {'"content/dsa/sorting-algorithms.mdx"'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sleek Footer */}
      <footer className="border-t border-border bg-background py-8 select-none shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Image
              src="/ss-logo.svg"
              width={100}
              height={100}
              alt="website-logo"
              className="dark:invert w-5 h-5"
            />
            <span>SyntaxSpace © 2026</span>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <Link href="/admin" className="hover:text-foreground">
                  Console
                </Link>
                <span>•</span>
              </>
            )}
            <Link href="/learn/dsa" className="hover:text-foreground">
              Syllabus
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
