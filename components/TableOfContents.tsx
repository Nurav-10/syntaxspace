"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import { usePathname } from "next/navigation";

interface TOCHeading {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3
}

export function TableOfContents() {
  const [headings, setHeadings] = React.useState<TOCHeading[]>([]);
  const [activeId, setActiveId] = React.useState<string>("");
  const pathname = usePathname();

  // Effect 1: Extract headings and listen to page changes / DOM mutation updates
  React.useEffect(() => {
    const updateHeadings = () => {
      const contentElement = document.querySelector("[data-mdx-content]");
      if (!contentElement) {
        setHeadings((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      const elements = Array.from(
        contentElement.querySelectorAll("h2, h3")
      ) as HTMLElement[];

      const headingData: TOCHeading[] = elements.map((el) => {
        if (!el.id) {
          el.id = el.textContent
            ? el.textContent
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")
            : "heading";
        }

        return {
          id: el.id,
          text: el.textContent || "",
          level: el.tagName === "H2" ? 2 : 3,
        };
      });

      // Only update state if headings actually changed to prevent infinite loops
      setHeadings((prev) => {
        const isSame =
          prev.length === headingData.length &&
          prev.every(
            (h, i) =>
              h.id === headingData[i].id &&
              h.text === headingData[i].text &&
              h.level === headingData[i].level
          );
        return isSame ? prev : headingData;
      });
    };

    // Run immediately on pathname change
    updateHeadings();

    // Set up MutationObserver to update headings if reading pane updates/hydrates
    const observer = new MutationObserver(() => {
      updateHeadings();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  // Effect 2: Setup dynamic intersection observer when headings list is updated
  React.useEffect(() => {
    if (headings.length === 0) {
      setActiveId("");
      return;
    }

    const observerOptions = {
      rootMargin: "0px 0px -60% 0px", // Trigger when heading is in upper half of viewport
      threshold: 1.0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Keep space for sticky navigation
      const yPosition =
        element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: yPosition, behavior: "smooth" });
    }
  };

  return (
    <aside className="hidden xl:block w-64 border-l border-border h-[calc(100vh-56px)] sticky top-14 self-start bg-background p-6 shrink-0 select-none transition-colors duration-200 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <List className="h-3.5 w-3.5" />
        <span>On This Page</span>
      </div>

      <nav className="relative border-l border-border pl-px py-1 space-y-3.5">
        {headings.map((heading, index) => {
          const isActive = activeId === heading.id;
          return (
            <a
              key={`${heading.id}-${index}`}
              href={`#${heading.id}`}
              onClick={(e) => scrollToHeading(e, heading.id)}
              className={cn(
                "block text-sm transition-all relative pl-4 border-l -ml-px",
                heading.level === 3 ? "pl-8" : "",
                isActive
                  ? "text-foreground font-semibold border-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
