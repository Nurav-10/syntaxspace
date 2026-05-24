import * as React from "react";
import { notFound } from "next/navigation";
import { getModuleContent } from "@/lib/content";
import { compileMDX } from "next-mdx-remote/rsc";
import { Callout } from "@/components/mdx/Callout";
import { DSAVisualizer } from "@/components/mdx/DSAVisualizer";
import { SQLPlayground } from "@/components/mdx/SQLPlayground";
import { cn } from "@/lib/utils";
import rehypeShiki from "@shikijs/rehype";
import { CodeTabs } from "@/components/mdx/CodeTabs";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { Steps, Step } from "@/components/mdx/Step";

interface LearnPageProps {
  params: Promise<{
    track: string;
    topic: string;
  }>;
}

export async function generateMetadata({
  params,
}: LearnPageProps): Promise<Metadata> {
  const { track, topic } = await params;
  const payload = await getModuleContent(track, topic);

  if (!payload) {
    return {
      title: "Module Not Found - SyntaxSpace",
    };
  }

  const capitalizedTrack = track.toUpperCase().replace("-", " ");
  return {
    title: `${payload.metadata.title} | ${capitalizedTrack} | SyntaxSpace`,
    description: payload.metadata.description,
    openGraph: {
      title: payload.metadata.title,
      description: payload.metadata.description,
      type: "article",
    },
  };
}

// Custom typography styling maps matching Vercel's clean aesthetic
const MDX_COMPONENTS = {
  Callout,
  DSAVisualizer,
  SQLPlayground,
  CodeTabs,
  Steps,
  Step,
  h1: (props: React.ComponentProps<"h1">) => (
    <h1
      className="text-2xl font-bold tracking-tight text-foreground mt-8 mb-4 border-b border-border/60 pb-2 font-sans"
      {...props}
    />
  ),
  h2: (props: React.ComponentProps<"h2">) => {
    // Dynamically resolve child text to build matching slug IDs
    const getHeadingText = (node: React.ReactNode): string => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(getHeadingText).join("");
      if (React.isValidElement(node)) {
        const element = node as React.ReactElement<{
          children?: React.ReactNode;
        }>;
        return getHeadingText(element.props.children);
      }
      return "";
    };
    const text = getHeadingText(props.children);
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return (
      <h2
        id={id}
        className="text-lg font-semibold tracking-tight text-foreground mt-8 mb-3 font-sans border-b border-border/30 pb-1 scroll-mt-20"
        {...props}
      />
    );
  },
  h3: (props: React.ComponentProps<"h3">) => {
    const getHeadingText = (node: React.ReactNode): string => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(getHeadingText).join("");
      if (React.isValidElement(node)) {
        const element = node as React.ReactElement<{
          children?: React.ReactNode;
        }>;
        return getHeadingText(element.props.children);
      }
      return "";
    };
    const text = getHeadingText(props.children);
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return (
      <h3
        id={id}
        className="text-base font-semibold tracking-tight text-foreground mt-6 mb-2 font-sans scroll-mt-20"
        {...props}
      />
    );
  },
  p: (props: React.ComponentProps<"p">) => (
    <p
      className="text-sm text-foreground/70 leading-relaxed my-4 font-sans"
      {...props}
    />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul
      className="list-disc pl-6 text-sm text-foreground/70 space-y-2 my-4 font-sans"
      {...props}
    />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol
      className="list-decimal pl-6 text-sm text-foreground/70 space-y-2 my-4 font-sans "
      {...props}
    />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="font-bold text-foreground" {...props} />
  ),
  code: ({ className, ...props }: React.ComponentProps<"code">) => {
    const isInline =
      !className ||
      (!className.includes("shiki") && !className.includes("language-"));
    return (
      <code
        className={cn(
          "font-mono text-xs",
          isInline
            ? "bg-muted border border-border/80 px-1.5 py-0.5 rounded text-foreground font-medium"
            : "bg-transparent border-0 p-0 rounded-none text-inherit",
          className,
        )}
        {...props}
      />
    );
  },
  pre: ({ className, ...props }: React.ComponentProps<"pre">) => (
    <pre
      className={cn(
        "border border-border rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto my-6 relative select-text [&_code]:bg-transparent [&_code]:border-0 [&_code]:p-0 [&_code]:rounded-none",
        className,
      )}
      {...props}
    />
  ),
  table: (props: React.ComponentProps<"table">) => (
    <div className="overflow-x-auto my-6 border border-border rounded-lg">
      <table
        className="w-full text-left border-collapse text-[11px]"
        {...props}
      />
    </div>
  ),
  thead: (props: React.ComponentProps<"thead">) => (
    <thead className="bg-muted/40 border-b border-border" {...props} />
  ),
  tbody: (props: React.ComponentProps<"tbody">) => (
    <tbody className="divide-y divide-border/60" {...props} />
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th
      className="px-4 py-2.5 font-bold font-mono text-foreground/70 uppercase border-r border-border/40 last:border-0"
      {...props}
    />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td
      className="px-4 py-2.5 font-mono text-foreground border-r border-border/40 last:border-0"
      {...props}
    />
  ),
};

export default async function LearnPage({ params }: LearnPageProps) {
  const { track, topic } = await params;

  // Load the local MDX file
  const payload = await getModuleContent(track, topic);

  if (!payload) {
    notFound();
  }

  // Compile MDX with remote React components
  const { content } = await compileMDX({
    source: payload.content,
    components: MDX_COMPONENTS,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: {
                light: "github-light",
                dark: "github-dark-high-contrast",
              },
            },
          ],
        ],
      },
    },
  });

  return (
    <article className="transition-colors duration-200">
      {/* Header Metadata */}
      <div className="pb-6 border-b border-border mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-foreground/70 uppercase tracking-widest">
          <span>{payload.metadata.track}</span>
          <span>•</span>
          <span>{payload.metadata.type}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2 font-sans">
          {payload.metadata.title}
        </h1>
        <p className="text-sm text-foreground/70 font-light mt-3 leading-relaxed">
          {payload.metadata.description}
        </p>

        {/* Date and Word Count */}
        <div className="flex gap-4 mt-6 text-sm text-foreground/70 font-mono">
          <div>
            Last Updated:{" "}
            <span className="text-foreground">
              {payload.metadata.lastModified}
            </span>
          </div>
          <div>
            Reading Time:{" "}
            <span className="text-foreground">
              {Math.ceil((payload.metadata.wordCount || 0) / 200)} min
            </span>
          </div>
        </div>
      </div>

      {/* Main MDX Body Wrapper */}
      <div data-mdx-content className="min-w-full select-text">
        {content}
      </div>
    </article>
  );
}
