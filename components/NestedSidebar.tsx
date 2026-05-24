"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Menu01Icon,
  Cancel01Icon,
  FolderOpenIcon,
  FolderIcon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarSubItem {
  title: string;
  slug: string;
}

interface SidebarGroup {
  title: string;
  items: SidebarSubItem[];
}

interface NestedSidebarProps {
  track: string;
}

export function NestedSidebar({ track }: NestedSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    {},
  );
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [groups, setGroups] = React.useState<SidebarGroup[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load track navigation items dynamically from database
  React.useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetch(`/api/sidebar?track=${encodeURIComponent(track)}`)
      .then((res) => (res.ok ? res.json() : { groups: [] }))
      .then((data) => {
        if (active) {
          setGroups(data.groups || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading sidebar data:", err);
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [track]);

  const handleTrackChange = (value: string | null) => {
    if (!value) return;
    router.push(`/learn/${value}`);
  };

  // Find current active item title for dynamic menu bar heading
  const activeItem = groups
    .flatMap((g) => g.items)
    .find((item) => pathname.endsWith(`${track}/${item.slug}`));
  
  const activeTitle = activeItem
    ? activeItem.title
    : pathname.endsWith(`/learn/${track}`)
    ? "Introduction"
    : "Menu";


  // Automatically expand group containing active subtopic on load
  React.useEffect(() => {
    const initialOpenGroups: Record<string, boolean> = {};
    groups.forEach((group) => {
      const hasActiveItem = group.items.some((item) =>
        pathname.endsWith(`${track}/${item.slug}`),
      );
      if (hasActiveItem) {
        initialOpenGroups[group.title] = true;
      } else {
        // Expand first group by default
        initialOpenGroups[groups[0]?.title] = true;
      }
    });
    setOpenGroups((prev) => ({ ...initialOpenGroups, ...prev }));
  }, [pathname, groups, track]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const getTrackTitle = () => {
    switch (track) {
      case "dsa":
        return "Data Structures & Algorithms";
      case "system-design":
        return "System Design";
      case "oops":
        return "OOPs Concepts";
      case "sql":
        return "SQL Mastery";
      default:
        return "Learning Module";
    }
  };

  const renderContent = () => (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Title */}
      <div className="px-4 py-6 border-b border-border">
        <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          Track
        </span>
        <h2 className=" font-semibold tracking-tight text-foreground mt-0.5">
          {getTrackTitle()}
        </h2>
      </div>

      {/* Group Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4 px-3">
            <div className="space-y-2">
              <div className="h-3.5 bg-muted animate-pulse rounded w-2/3" />
              <div className="space-y-1.5 pl-4">
                <div className="h-2.5 bg-muted/60 animate-pulse rounded w-3/4" />
                <div className="h-2.5 bg-muted/60 animate-pulse rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3.5 bg-muted animate-pulse rounded w-1/2" />
              <div className="space-y-1.5 pl-4">
                <div className="h-2.5 bg-muted/60 animate-pulse rounded w-2/3" />
              </div>
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div className="px-3 py-2 text-xs font-light text-muted-foreground leading-relaxed border border-dashed border-border rounded-lg bg-card/40 m-2">
            No topics available yet. Create one in the admin panel.
          </div>
        ) : (
          groups.map((group) => {
            const isOpen = !!openGroups[group.title];
            return (
              <div key={group.title} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    {isOpen ? (
                      <HugeiconsIcon
                        icon={FolderOpenIcon}
                        className="h-3.5 w-3.5 text-foreground"
                      />
                    ) : (
                      <HugeiconsIcon icon={FolderIcon} className="h-3.5 w-3.5" />
                    )}
                    <span>{group.title}</span>
                  </div>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isOpen
                        ? "rotate-90 text-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                </button>

                {/* Nested Collapsible Sub-items */}
                <div
                  className={cn(
                    "pl-5 space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0",
                  )}
                >
                  {group.items.map((item) => {
                    const targetHref = `/learn/${track}/${item.slug}`;
                    const isActive = pathname === targetHref;
                    return (
                      <Link
                        key={item.slug}
                        href={targetHref}
                        className={cn(
                          "block px-3 py-1.5 rounded text-xs transition-all relative",
                          isActive
                            ? "font-semibold text-foreground bg-accent/20 pl-5"
                            : "text-muted-foreground hover:text-foreground hover:pl-5 transition-all pl-3",
                        )}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {isActive && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-linear-to-b from-blue-500 to-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]" />
                        )}
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Trigger */}
      <div className="md:hidden sticky top-[56px] z-40 flex items-center justify-between bg-background border-b border-border px-4 py-2 w-full">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
        >
          <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4" />
          <span>{activeTitle}</span>
        </button>
        <Select value={track} onValueChange={handleTrackChange}>
          <SelectTrigger
            size="sm"
            className="h-7 border-0 bg-transparent py-0 text-xs font-bold font-mono text-muted-foreground hover:text-foreground"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            align="end"
            className="min-w-40 bg-popover border border-border"
          >
            <SelectItem value="dsa">DSA</SelectItem>
            <SelectItem value="system-design">SYSTEM DESIGN</SelectItem>
            <SelectItem value="oops">OOPS</SelectItem>
            <SelectItem value="sql">SQL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border h-[calc(100vh-56px)] sticky top-14 self-start bg-background shrink-0 transition-colors duration-200">
        {renderContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          {/* Mobile Drawer Pane */}
          <div
            className="fixed top-0 left-0 bottom-0 w-72 bg-background border-r border-border z-50 p-4 transition-transform duration-300 animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="h-8 w-8 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
              </button>
            </div>
            <div className="h-[calc(100vh-80px)] overflow-hidden">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
