"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

interface CodeTabsProps {
  children: React.ReactNode;
  labels?: string[];
}

export function CodeTabs({ children, labels }: CodeTabsProps) {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  // Filter valid React elements (code blocks, custom pre wrappers, etc.)
  const childrenArray = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child)
  );

  // Auto-detect labels from child elements if not provided explicitly
  const tabLabels = React.useMemo(() => {
    if (labels && labels.length > 0) return labels;

    return childrenArray.map((child, idx) => {
      // 1. Try to extract from the first line comment for highly descriptive labels
      const extractText = (node: React.ReactNode): string => {
        if (!node) return "";
        if (typeof node === "string" || typeof node === "number") return String(node);
        if (Array.isArray(node)) return node.map(extractText).join("");
        if (React.isValidElement(node)) {
          const props = node.props as { children?: React.ReactNode };
          if (props.children) {
            return extractText(props.children);
          }
        }
        return "";
      };

      const rawText = extractText(child);
      const firstLine = rawText.split("\n")[0]?.trim() || "";
      const commentMatch = firstLine.match(/^(\/\/|--|#)\s*(.+)$/);
      
      if (commentMatch) {
        const commentText = commentMatch[2].trim();
        // Clean up common suffixes to keep it concise and clean
        let cleanLabel = commentText
          .replace(/\s+(implementation|template|representation|schema|syntax|example|code|script)$/i, "")
          .trim();
        
        // Remove trailing parentheses like "(TypeScript)" or "(SQL)"
        cleanLabel = cleanLabel.replace(/\s*\([^)]*\)$/, "").trim();

        if (cleanLabel.length >= 3 && cleanLabel.length <= 28) {
          return cleanLabel;
        }
      }

      // 2. Fall back to searching for a className or data attribute containing language information recursively
      const findClassName = (node: React.ReactNode): string => {
        if (!node) return "";
        if (typeof node === "string" || typeof node === "number") return "";
        
        if (Array.isArray(node)) {
          for (const item of node) {
            const classRes = findClassName(item);
            if (classRes) return classRes;
          }
          return "";
        }

        if (React.isValidElement(node)) {
          const props = node.props as { className?: string; children?: React.ReactNode; [key: string]: unknown };
          if (props.className) {
            const cls = props.className;
            if (cls.includes("language-") || cls.includes("lang-")) {
              return cls;
            }
          }

          for (const key of Object.keys(props)) {
            const keyLower = key.toLowerCase();
            if (keyLower.includes("lang") || keyLower.includes("language")) {
              const val = props[key];
              if (typeof val === "string" && val.trim().length > 0) {
                return `language-${val}`;
              }
            }
          }

          if (props.children) {
            return findClassName(props.children);
          }
        }
        return "";
      };

      const className = findClassName(child);
      const langMatch =
        className.match(/language-([\w+\-#]+)/) ||
        className.match(/lang-([\w+\-#]+)/);

      if (langMatch) {
        const lang = langMatch[1].toLowerCase();
        if (lang === "typescript" || lang === "ts") return "TypeScript";
        if (lang === "javascript" || lang === "js") return "JavaScript";
        if (lang === "cpp" || lang === "c++") return "C++";
        if (lang === "java") return "Java";
        if (lang === "python" || lang === "py") return "Python";
        if (lang === "rust" || lang === "rs") return "Rust";
        if (lang === "go") return "Go";
        if (lang === "sql") return "SQL";
        if (lang === "html") return "HTML";
        if (lang === "css") return "CSS";
        if (lang === "bash" || lang === "sh") return "Bash";
        return lang.toUpperCase();
      }
      return `Tab ${idx + 1}`;
    });
  }, [childrenArray, labels]);

  const handleCopy = async () => {
    const activeChild = childrenArray[activeIdx];
    if (!activeChild) return;

    // Traverses nested children to extract raw text content of selected code block
    const extractText = (node: React.ReactNode): string => {
      if (!node) return "";
      if (typeof node === "string" || typeof node === "number") return String(node);
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (React.isValidElement(node)) {
        const props = node.props as { children?: React.ReactNode };
        if (props.children) {
          return extractText(props.children);
        }
      }
      return "";
    };

    const text = extractText(activeChild);
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (childrenArray.length === 0) return null;

  return (
    <div className="my-6 border border-border rounded-lg overflow-hidden bg-card select-text">
      {/* Header Tabs Navigation */}
      <div className="flex justify-between items-center bg-muted/40 px-4 py-2 border-b border-border select-none">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {tabLabels.map((label, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono rounded-md font-semibold transition-all relative cursor-pointer",
                  isActive
                    ? "bg-background text-foreground border border-border shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title="Copy Code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Code Container */}
      <div className="relative">
        {childrenArray.map((child, idx) => (
          <div
            key={idx}
            className={cn(
              "outline-none",
              idx === activeIdx ? "block" : "hidden"
            )}
          >
            {/* Override standard pre/code components margins so they sit perfectly flush inside CodeTabs container */}
            <div className="[&>pre]:my-0 [&>pre]:border-0 [&>pre]:rounded-none [&>pre]:bg-transparent!">
              {child}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
