"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchStore, SearchItem, SearchHeading } from "@/lib/search-store";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Cancel01Icon,
  BookOpen01Icon,
  DatabaseIcon,
  WorkflowSquare01Icon,
  Settings02Icon,
  ComputerIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

// Interface for structured items selectable via arrow keys
interface FilteredResult {
  type: "article" | "heading";
  item: SearchItem;
  heading?: SearchHeading;
  title: string;
  subtitle: string;
  href: string;
}

// Helper to match category icon dynamically with full type safety
const getTrackIcon = (track: string) => {
  switch (track) {
    case "dsa":
      return BookOpen01Icon;
    case "sql":
      return DatabaseIcon;
    case "system-design":
      return WorkflowSquare01Icon;
    case "oops":
      return Settings02Icon;
    default:
      return ComputerIcon;
  }
};

export function SearchDialog() {
  const router = useRouter();
  const { items, isLoading, isOpen, setIsOpen, fetchSearchIndex } =
    useSearchStore();

  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // 1. Hotkey trigger (⌘K / Ctrl+K)
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
        fetchSearchIndex();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, setIsOpen, fetchSearchIndex]);

  // 2. Pre-fetch and focus on modal mount
  React.useEffect(() => {
    if (isOpen) {
      fetchSearchIndex();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen, fetchSearchIndex]);

  // 3. Match indexing logic (Articles + Sections/Headings)
  const filteredResults: FilteredResult[] = React.useMemo(() => {
    const trimmed = query.toLowerCase().trim();
    if (!trimmed) return [];

    const results: FilteredResult[] = [];

    items.forEach((item) => {
      // Direct Article matches (Title / Description / Category)
      const isArticleMatch =
        item.title.toLowerCase().includes(trimmed) ||
        item.description.toLowerCase().includes(trimmed) ||
        item.trackName.toLowerCase().includes(trimmed) ||
        item.subCategoryName.toLowerCase().includes(trimmed);

      if (isArticleMatch) {
        results.push({
          type: "article",
          item,
          title: item.title,
          subtitle: `${item.trackName} • ${item.subCategoryName}`,
          href: `/learn/${item.track}/${item.slug}`,
        });
      }

      // Dynamic Section / Heading level matches
      item.headings.forEach((heading) => {
        if (heading.text.toLowerCase().includes(trimmed)) {
          results.push({
            type: "heading",
            item,
            heading,
            title: heading.text,
            subtitle: `In "${item.title}" (${item.trackName})`,
            href: `/learn/${item.track}/${item.slug}#${heading.slug}`,
          });
        }
      });
    });

    return results;
  }, [items, query]);

  // 4. Index Selection boundaries
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 5. Navigation wrapper
  const handleNavigate = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  // 6. Keyboard navigation handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredResults.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleNavigate(filteredResults[selectedIndex].href);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  const trackFastTravels = [
    { name: "DSA Syllabus", href: "/learn/dsa", track: "dsa" },
    {
      name: "System Design Guides",
      href: "/learn/system-design",
      track: "system-design",
    },
    { name: "OOPs Principles", href: "/learn/oops", track: "oops" },
    { name: "SQL Index Directory", href: "/learn/sql", track: "sql" },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-background/60 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
      onKeyDown={handleKeyDown}
    >
      {/* Dialog card */}
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search bar */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-border">
          <HugeiconsIcon
            icon={Search01Icon}
            className="h-4 w-4 text-muted-foreground shrink-0"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a topic, description, or heading section..."
            className="flex-1 h-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="text-[10px] font-mono border border-border bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-semibold">
            ESC
          </span>
        </div>

        {/* Dynamic Display Area */}
        <div className="flex-1 max-h-[350px] overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            // Shimmer compilation loading skeleton
            <div className="p-3 space-y-3">
              <div className="space-y-1">
                <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-3 bg-muted/60 animate-pulse rounded w-2/3" />
              </div>
              <div className="space-y-1 pt-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                <div className="h-3 bg-muted/60 animate-pulse rounded w-1/2" />
              </div>
            </div>
          ) : !query ? (
            // Fast-Travel Guides for empty search states
            <div className="p-3 space-y-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground font-mono uppercase">
                  Syllabus Orbit Fast-Travel
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {trackFastTravels.map((ft) => {
                    const icon = getTrackIcon(ft.track);
                    return (
                      <button
                        key={ft.href}
                        onClick={() => handleNavigate(ft.href)}
                        className="flex items-center gap-2.5 px-3 py-2 border border-border rounded-lg bg-muted/20 text-xs text-foreground font-semibold hover:border-foreground/20 hover:bg-accent/30 text-left transition-all cursor-pointer group"
                      >
                        <HugeiconsIcon
                          icon={icon}
                          className="h-3.5 w-3.5 text-muted-foreground"
                        />
                        <span className="flex-1 truncate">{ft.name}</span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/80 font-light leading-relaxed">
                Tip: Search dynamically indexes H1/H2/H3 titles (like{" "}
                <code className="font-mono bg-muted px-1 py-0.5 rounded text-foreground text-[9px]">
                  bubble sort
                </code>
                ) to direct you immediately to the specific sub-section
                page-anchor.
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            // No matches found
            <div className="py-12 text-center text-xs text-muted-foreground font-light">
              No index matches found for &ldquo;
              <span className="font-bold text-foreground">{query}</span>&rdquo;.
            </div>
          ) : (
            // Result mapping
            filteredResults.map((res, index) => {
              const isSelected = index === selectedIndex;
              const icon = getTrackIcon(res.item.track);

              return (
                <button
                  key={`${res.type}-${res.item.id}-${res.heading?.slug || ""}-${index}`}
                  onClick={() => handleNavigate(res.href)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer border",
                    isSelected
                      ? "bg-accent/40 border-foreground/10"
                      : "bg-transparent border-transparent hover:bg-muted/15",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center border",
                        isSelected
                          ? "bg-foreground text-background border-foreground"
                          : "bg-muted/30 border-border text-muted-foreground",
                      )}
                    >
                      <HugeiconsIcon icon={icon} className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {res.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-light flex items-center gap-1.5 truncate mt-0.5">
                        <span className="capitalize">{res.type}</span>
                        <span>•</span>
                        <span>{res.subtitle}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {res.type === "heading" && (
                      <span className="text-[8px] font-bold font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                        Section Anchor
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[9px] font-mono bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground font-bold shrink-0 animate-pulse">
                        ↵ ENTER
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer actions helper */}
        <div className="px-4 py-2 border-t border-border bg-muted/10 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
          <div className="flex gap-4">
            <span>↑↓ Navigation</span>
            <span>↵ Select</span>
          </div>
          <div>⌘K to toggle</div>
        </div>
      </div>
    </div>
  );
}
