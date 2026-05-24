import * as React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  DatabaseIcon,
  WorkflowSquare01Icon,
  Settings02Icon,
  ComputerIcon,
  PlusSignIcon,
  TaskIcon,
} from "@hugeicons/core-free-icons";

interface CategoryIntroPageProps {
  params: Promise<{
    track: string;
  }>;
}

// Track configuration map for matching Vercel's clean aesthetic with customized gradients & styles
interface TrackTheme {
  title: string;
  gradientText: string;
  glowBg: string;
  borderHover: string;
  accentColor: string;
  icon: readonly (readonly [string, { readonly [key: string]: string | number }])[];
}

const TRACK_THEMES: Record<string, TrackTheme> = {
  dsa: {
    title: "Data Structures & Algorithms",
    gradientText: "from-blue-600 via-cyan-500 to-indigo-500 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400",
    glowBg: "bg-cyan-500/10 dark:bg-cyan-500/5",
    borderHover: "hover:border-cyan-500/25 dark:hover:border-cyan-500/20",
    accentColor: "text-cyan-600 dark:text-cyan-400",
    icon: BookOpen01Icon,
  },
  "system-design": {
    title: "Distributed System Design",
    gradientText: "from-indigo-600 via-violet-500 to-purple-500 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400",
    glowBg: "bg-violet-500/10 dark:bg-violet-500/5",
    borderHover: "hover:border-violet-500/25 dark:hover:border-violet-500/20",
    accentColor: "text-violet-600 dark:text-violet-400",
    icon: WorkflowSquare01Icon,
  },
  oops: {
    title: "Object-Oriented Programming",
    gradientText: "from-amber-600 via-orange-500 to-yellow-500 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400",
    glowBg: "bg-amber-500/10 dark:bg-amber-500/5",
    borderHover: "hover:border-amber-500/25 dark:hover:border-amber-500/20",
    accentColor: "text-amber-600 dark:text-amber-400",
    icon: Settings02Icon,
  },
  sql: {
    title: "SQL Mastery & Relational Databases",
    gradientText: "from-emerald-600 via-teal-500 to-green-500 dark:from-emerald-400 dark:via-teal-400 dark:to-green-400",
    glowBg: "bg-emerald-500/10 dark:bg-emerald-500/5",
    borderHover: "hover:border-emerald-500/25 dark:hover:border-emerald-500/20",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    icon: DatabaseIcon,
  },
};

const DEFAULT_THEME: TrackTheme = {
  title: "Learning Track",
  gradientText: "from-zinc-600 via-neutral-500 to-slate-500 dark:from-zinc-400 dark:via-neutral-400 dark:to-slate-400",
  glowBg: "bg-zinc-500/10 dark:bg-zinc-500/5",
  borderHover: "hover:border-zinc-500/25 dark:hover:border-zinc-500/20",
  accentColor: "text-zinc-600 dark:text-zinc-400",
  icon: ComputerIcon,
};

export async function generateMetadata({
  params,
}: CategoryIntroPageProps): Promise<Metadata> {
  const { track } = await params;
  const category = await prisma.category.findUnique({
    where: { slug: track },
  });

  if (!category) {
    return {
      title: "Learning Track - SyntaxSpace",
    };
  }

  const theme = TRACK_THEMES[track] || { title: category.name };

  return {
    title: `${theme.title} | SyntaxSpace`,
    description:
      category.description ||
      `Master the core concepts of ${category.name} with structured modules, theoretical breakdowns, and live visual sandboxes.`,
    openGraph: {
      title: theme.title,
      description:
        category.description ||
        `Master the core concepts of ${category.name} with structured modules, theoretical breakdowns, and live visual sandboxes.`,
    },
  };
}

export default async function CategoryIntroPage({ params }: CategoryIntroPageProps) {
  const { track } = await params;

  // Fetch Category, SubCategories, and published modules dynamically from DB
  const category = await prisma.category.findUnique({
    where: { slug: track },
    include: {
      subCategories: {
        orderBy: { order: "asc" },
        include: {
          contents: {
            where: { published: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              wordCount: true,
              lastModified: true,
            },
          },
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Resolve Track Theme & Aesthetics
  const theme = TRACK_THEMES[track] || {
    ...DEFAULT_THEME,
    title: category.name,
  };

  const subCategories = category.subCategories || [];
  const allContents = subCategories.flatMap((sub) => sub.contents);
  const totalModules = allContents.length;
  const totalWords = allContents.reduce((sum, c) => sum + (c.wordCount || 0), 0);
  const totalReadingTime = Math.ceil(totalWords / 200);

  // Locate the very first published content item to route CTA "Start learning"
  const firstContent = subCategories
    .find((sub) => sub.contents.length > 0)
    ?.contents[0];

  const startHref = firstContent
    ? `/learn/${track}/${firstContent.slug}`
    : null;

  return (
    <div className="relative space-y-10 pb-16">
      {/* Background Decorative Glow (Matches Theme Color) */}
      <div className={`absolute -top-32 left-10 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none z-0 ${theme.glowBg}`} />

      {/* Intro Header */}
      <div className="relative z-10 space-y-4 border-b border-border pb-8">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-muted-foreground uppercase">
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={theme.icon} className="h-3.5 w-3.5" />
            {category.slug.replace("-", " ")}
          </span>
          <span>•</span>
          <span>Syllabus Directory</span>
        </div>

        <h1 className={`text-4xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r font-sans ${theme.gradientText}`}>
          {category.name}
        </h1>

        <p className="text-sm md:text-base text-foreground/70 font-light leading-relaxed max-w-2xl pt-1">
          {category.description || `Master the core concepts of ${category.name} with structured modules, theoretical breakdowns, and live visual sandboxes.`}
        </p>

        {/* Dynamic Stats Row */}
        <div className="flex flex-wrap gap-6 pt-4 text-xs font-mono text-muted-foreground">
          <div className="flex flex-col gap-1 pr-6 border-r border-border/80">
            <span className="text-[10px] uppercase tracking-widest">Modules Available</span>
            <span className="text-sm font-bold text-foreground">{totalModules} topics</span>
          </div>
          <div className="flex flex-col gap-1 pr-6 border-r border-border/80">
            <span className="text-[10px] uppercase tracking-widest">Total Words</span>
            <span className="text-sm font-bold text-foreground">{totalWords.toLocaleString()} words</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest">Estimated Completion</span>
            <span className="text-sm font-bold text-foreground">{totalReadingTime || 0} min reading</span>
          </div>
        </div>

        {/* Dynamic CTA */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          {startHref ? (
            <Link
              href={startHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-semibold text-background hover:bg-foreground/90 transition-all shadow-md group"
            >
              <span>Start Curriculum</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          ) : (
            <Link
              href={`/dashboard/create?track=${track}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-accent transition-all"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
              <span>Create First Module (Admin)</span>
            </Link>
          )}
        </div>
      </div>

      {/* Syllabus Roadmap Grid */}
      <div className="relative z-10 space-y-8">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Syllabus Curriculum Index
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Follow the curriculum order below. Click on any topic to dive directly into detailed sheets.
          </p>
        </div>

        {totalModules === 0 ? (
          <div className="border border-dashed border-border bg-card rounded-xl p-10 text-center select-none space-y-4">
            <HugeiconsIcon icon={TaskIcon} className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-foreground">No Modules Yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                Admins have not saved any technical modules inside this track yet. Add a new module in the studio desk.
              </p>
            </div>
            <Link
              href={`/dashboard/create?track=${track}`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-foreground px-4 text-xs font-semibold text-background hover:bg-foreground/80 transition-colors"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="h-3 w-3" />
              <span>Add Module</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {subCategories.map((group) => {
              const publishedItems = group.contents;
              if (publishedItems.length === 0) return null;

              return (
                <div key={group.id} className="space-y-4">
                  {/* SubCategory Heading */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase">
                      {group.name}
                    </span>
                    <span className="h-px flex-1 bg-border/40" />
                  </div>

                  {/* Modules Card Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publishedItems.map((item) => {
                      const itemReadTime = Math.ceil((item.wordCount || 0) / 200);
                      return (
                        <Link
                          key={item.id}
                          href={`/learn/${track}/${item.slug}`}
                          className={`group block p-5 rounded-xl border border-border bg-card hover:bg-muted/15 transition-all duration-300 ${theme.borderHover}`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="text-sm font-bold text-foreground group-hover:underline leading-tight">
                                {item.title}
                              </h3>
                              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap pt-0.5">
                                {itemReadTime || 1} min
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-light line-clamp-2 leading-relaxed">
                              {item.description || "Learn the concepts, formulas, and visual breakdowns for this topic."}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors pt-2 uppercase tracking-wide">
                              <span>Open Module</span>
                              <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
