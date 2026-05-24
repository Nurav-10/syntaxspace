"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  BookOpen01Icon,
  WorkflowSquare01Icon,
  Settings02Icon,
  DatabaseIcon,
} from "@hugeicons/core-free-icons";

// Statically declared outside to prevent component re-creation / loop triggers
const quotes = [
  {
    text: "Not all who wander are lost... some are just compiling in the wrong thread.",
    author: "Thread 404",
  },
  {
    text: "We searched the entire memory heap, but the reference returned undefined.",
    author: "Garbage Collector",
  },
  {
    text: "In syntax, as in life, a single missing semicolon can alter the entire structure.",
    author: "Syntax Compiler",
  },
  {
    text: "Reality is merely a simulation where the route handler returned 404.",
    author: "System Architect",
  },
  {
    text: "We traversed from root to leaf node, but this BST key was null.",
    author: "Binary Search Tree",
  },
  {
    text: "Queries come, and queries go, but this relation was never mapped.",
    author: "SQL Joiner",
  },
  {
    text: "Optimism is a software developer's best friend. 404 is the reality check.",
    author: "Null Pointer",
  }
];

export default function NotFound() {
  const [quote, setQuote] = React.useState({ text: "", author: "" });

  React.useEffect(() => {
    // Stably set a random quote once on mount
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070708] text-zinc-600 dark:text-zinc-300 flex flex-col items-center justify-center relative overflow-hidden select-none px-4 py-12 transition-colors duration-200">
      
      {/* Background Static Grid Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_50%,transparent_100%)] pointer-events-none z-0" />

      {/* Static Premium Ambient Background Glows */}
      <div className="absolute -top-40 left-1/4 w-[350px] h-[350px] rounded-full bg-violet-500/10 dark:bg-violet-600/5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/5 dark:bg-emerald-600/3 blur-[120px] pointer-events-none z-0" />

      {/* Sleek Stable Glassmorphic Card */}
      <div className="w-full max-w-xl bg-white/70 dark:bg-zinc-950/45 border border-black/[0.05] dark:border-white/[0.06] rounded-2xl shadow-[0_15px_40px_-5px_rgba(99,102,241,0.06)] dark:shadow-[0_0_50px_-12px_rgba(168,85,247,0.15)] backdrop-blur-md p-8 text-center space-y-6 z-10 hover:border-violet-500/20 dark:hover:border-violet-500/20 transition-all duration-200">
        
        {/* Pulsating 404 Badge */}
        <div className="relative inline-flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-violet-500/20 dark:bg-violet-500/15 blur-xl scale-75 animate-pulse opacity-40 pointer-events-none" />
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-emerald-500 dark:from-violet-400 dark:via-fuchsia-500 dark:to-emerald-400 select-none leading-none">
            404
          </h1>
        </div>

        {/* Text descriptions */}
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-800 dark:text-white font-sans">
            Segment Fault: Reference Not Found
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
            The active path returned an empty pointer. It may have been garbage collected, refactored, or compiled elsewhere.
          </p>
        </div>

        {/* Static Premium Diagnostics block */}
        <div className="relative py-5 px-6 bg-zinc-50/50 dark:bg-black/[0.15] border border-black/5 dark:border-white/[0.05] rounded-xl text-left font-mono shadow-inner">
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold select-none uppercase tracking-wider mb-2">
            {"// COMPILER_DIAGNOSTICS"}
          </div>
          <div className="space-y-2">
            <p className="text-xs md:text-sm text-zinc-700 dark:text-zinc-300 italic leading-relaxed font-light select-text">
              &ldquo;{quote.text || "Searching memory registers..."}&rdquo;
            </p>
            {quote.author && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wide uppercase text-right select-none">
                &mdash; {quote.author}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto h-10 px-6 rounded-lg bg-zinc-900 text-white dark:bg-[#f4f4f5] dark:text-[#09090b] text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer shadow-md dark:shadow-none"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="h-4 w-4 transition-transform group-hover/btn:-translate-x-1"
            />
            <span>Return to Orbit</span>
          </Link>
          <Link
            href="/admin"
            className="w-full sm:w-auto h-10 px-6 rounded-lg border border-black/10 dark:border-white/10 bg-transparent text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 text-zinc-800 dark:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Suggested Fast-Travel Paths */}
      <div className="w-full max-w-xl mt-8 z-10 space-y-4">
        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block text-center select-none">
          Fast-Travel Orbit Nodes
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Link
            href="/learn/dsa"
            className="p-3 bg-white/50 dark:bg-zinc-950/20 border border-black/5 dark:border-white/5 hover:border-violet-500/25 dark:hover:border-violet-500/20 rounded-xl flex items-center gap-3 transition-all hover:bg-white dark:hover:bg-white/[0.02] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_4px_12px_rgba(139,92,246,0.06)] group/track"
          >
            <div className="h-9.5 w-9.5 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400 shrink-0">
              <HugeiconsIcon icon={BookOpen01Icon} className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-white block group-hover/track:text-violet-500 dark:group-hover/track:text-violet-400 transition-colors">
                DSA Track
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-400 block font-light mt-0.5">
                Structures & algorithms
              </span>
            </div>
          </Link>

          <Link
            href="/learn/system-design"
            className="p-3 bg-white/50 dark:bg-zinc-950/20 border border-black/5 dark:border-white/5 hover:border-[#10b981]/25 dark:hover:border-[#10b981]/20 rounded-xl flex items-center gap-3 transition-all hover:bg-white dark:hover:bg-white/[0.02] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_4px_12px_rgba(16,185,129,0.06)] group/track"
          >
            <div className="h-9.5 w-9.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] shrink-0">
              <HugeiconsIcon icon={WorkflowSquare01Icon} className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-white block group-hover/track:text-[#10b981] transition-colors">
                System Design
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-400 block font-light mt-0.5">
                Distributed design
              </span>
            </div>
          </Link>

          <Link
            href="/learn/oops"
            className="p-3 bg-white/50 dark:bg-zinc-950/20 border border-black/5 dark:border-white/5 hover:border-amber-500/25 dark:hover:border-amber-500/20 rounded-xl flex items-center gap-3 transition-all hover:bg-white dark:hover:bg-white/[0.02] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_4px_12px_rgba(245,158,11,0.06)] group/track"
          >
            <div className="h-9.5 w-9.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
              <HugeiconsIcon icon={Settings02Icon} className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-white block group-hover/track:text-amber-500 dark:group-hover/track:text-amber-400 transition-colors">
                OOPs Principles
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-400 block font-light mt-0.5">
                Patterns & modular design
              </span>
            </div>
          </Link>

          <Link
            href="/learn/sql"
            className="p-3 bg-white/50 dark:bg-zinc-950/20 border border-black/5 dark:border-white/5 hover:border-blue-500/25 dark:hover:border-blue-500/20 rounded-xl flex items-center gap-3 transition-all hover:bg-white dark:hover:bg-white/[0.02] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_4px_12px_rgba(59,130,246,0.06)] group/track"
          >
            <div className="h-9.5 w-9.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
              <HugeiconsIcon icon={DatabaseIcon} className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-white block group-hover/track:text-blue-500 dark:group-hover/track:text-blue-400 transition-colors">
                SQL Mastery
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-400 block font-light mt-0.5">
                Databases & index structures
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
