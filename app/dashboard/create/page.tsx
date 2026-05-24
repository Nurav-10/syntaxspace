"use client";

import * as React from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Callout } from "@/components/mdx/Callout";
import { DSAVisualizer } from "@/components/mdx/DSAVisualizer";
import { SQLPlayground } from "@/components/mdx/SQLPlayground";
import { CodeTabs } from "@/components/mdx/CodeTabs";
import { useUploadThing } from "@/lib/uploadthing";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Upload02Icon,
  ImageAdd02Icon,
  FloppyDiskIcon,
  CodeIcon,
  HeadingIcon,
  GridIcon,
} from "@hugeicons/core-free-icons";
import { List, Info } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Client-side lightweight parser to render markdown + custom widgets in real-time
function renderMdxClientSide(mdxText: string) {
  if (!mdxText)
    return (
      <p className="text-muted-foreground text-xs font-light">
        Type some markdown to see the live preview...
      </p>
    );

  const lines = mdxText.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul
          key={`list-${key}`}
          className="list-disc pl-6 text-xs text-muted-foreground space-y-1.5 my-4 font-sans font-light"
        >
          {...currentList}
        </ul>,
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Code Blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End of block
        const codeText = codeBlockLines.join("\n");
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-black text-zinc-200 border border-zinc-900 rounded-lg p-4 font-mono text-[10px] leading-relaxed overflow-x-auto my-5 select-text [&_code]:bg-transparent [&_code]:border-0 [&_code]:p-0 [&_code]:rounded-none"
          >
            <code>{codeText}</code>
          </pre>,
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        // Start of block
        flushList(String(i));
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Handle interactive custom tags (exact component matches)
    if (line.trim() === "<DSAVisualizer />") {
      flushList(String(i));
      elements.push(<DSAVisualizer key={`widget-dsa-${i}`} />);
      continue;
    }

    if (line.trim() === "<SQLPlayground />") {
      flushList(String(i));
      elements.push(<SQLPlayground key={`widget-sql-${i}`} />);
      continue;
    }

    // Handle CodeTabs container: e.g. <CodeTabs>...</CodeTabs>
    if (line.trim().startsWith("<CodeTabs")) {
      flushList(String(i));
      
      // Capture lines up until </CodeTabs>
      let j = i + 1;
      const tabsContentLines: string[] = [];
      while (j < lines.length && !lines[j].trim().startsWith("</CodeTabs>")) {
        tabsContentLines.push(lines[j]);
        j++;
      }
      i = j; // Advance outer loop past the block
      
      // Parse the captured lines to extract individual code blocks
      const tabBlocks: React.ReactNode[] = [];
      let inTabCodeBlock = false;
      let tabCodeBlockLines: string[] = [];
      let tabLang = "ts";
      
      for (let k = 0; k < tabsContentLines.length; k++) {
        const tLine = tabsContentLines[k];
        if (tLine.trim().startsWith("```")) {
          if (inTabCodeBlock) {
            // End of inner code block
            const codeText = tabCodeBlockLines.join("\n");
            tabBlocks.push(
              <pre
                key={`tab-pre-${k}`}
                className={`language-${tabLang} bg-black text-zinc-200 border border-zinc-900 rounded-lg p-4 font-mono text-[10px] leading-relaxed overflow-x-auto [&_code]:bg-transparent [&_code]:border-0 [&_code]:p-0 [&_code]:rounded-none`}
              >
                <code className={`language-${tabLang}`}>{codeText}</code>
              </pre>
            );
            tabCodeBlockLines = [];
            inTabCodeBlock = false;
          } else {
            // Start of inner code block
            const match = tLine.trim().match(/```(\w*)/);
            tabLang = match && match[1] ? match[1] : "ts";
            inTabCodeBlock = true;
          }
        } else if (inTabCodeBlock) {
          tabCodeBlockLines.push(tLine);
        }
      }
      
      elements.push(
        <CodeTabs key={`codetabs-${i}`}>
          {tabBlocks}
        </CodeTabs>
      );
      continue;
    }

    // Handle Callouts: e.g. <Callout type="tip" title="...">Text</Callout>
    if (
      line.trim().startsWith("<Callout") ||
      line.trim().startsWith("</Callout>")
    ) {
      flushList(String(i));

      if (line.trim().startsWith("<Callout")) {
        const typeMatch = line.match(/type="(\w+)"/);
        const titleMatch = line.match(/title="(.+?)"/);
        const type = (typeMatch ? typeMatch[1] : "info") as
          | "info"
          | "warning"
          | "tip"
          | "danger";
        const title = titleMatch ? titleMatch[1] : undefined;

        // Find children up until </Callout>
        let calloutContent = "";
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith("</Callout>")) {
          calloutContent += lines[j] + "\n";
          j++;
        }
        i = j; // skip lines inside callout in outer loop

        elements.push(
          <Callout key={`callout-${i}`} type={type} title={title}>
            {calloutContent.trim()}
          </Callout>,
        );
      }
      continue;
    }

    // Handle headings
    if (line.startsWith("# ")) {
      flushList(String(i));
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-2xl font-bold tracking-tight text-foreground mt-6 mb-3 font-sans border-b border-border pb-1"
        >
          {line.slice(2)}
        </h1>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList(String(i));
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-lg font-semibold tracking-tight text-foreground mt-6 mb-3 font-sans border-b border-border/40 pb-1"
        >
          {line.slice(3)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flushList(String(i));
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-base font-semibold tracking-tight text-foreground mt-5 mb-2 font-sans"
        >
          {line.slice(4)}
        </h3>,
      );
      continue;
    }

    // Handle Bullet list items
    if (line.startsWith("- ") || line.startsWith("* ")) {
      currentList.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {line.slice(2)}
        </li>,
      );
      continue;
    }

    // Handle simple empty line
    if (!line.trim()) {
      flushList(String(i));
      continue;
    }

    // Standard paragraph line (if not captured elsewhere)
    flushList(String(i));

    // Check if it's an image
    const imgRegex = /!\[(.*?)\]\((.*?)\)/;
    const imgMatch = line.match(imgRegex);
    if (imgMatch) {
      elements.push(
        <div key={`img-${i}`} className="my-5 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgMatch[2]}
            alt={imgMatch[1]}
            className="rounded-lg max-h-72 border border-border bg-muted/20 object-cover"
          />
          <span className="text-[10px] text-muted-foreground mt-1.5 font-mono">
            {imgMatch[1]}
          </span>
        </div>,
      );
      continue;
    }

    elements.push(
      <p
        key={`p-${i}`}
        className="text-xs text-muted-foreground leading-relaxed my-3 font-sans font-light"
      >
        {line}
      </p>,
    );
  }

  flushList("final");
  return elements;
}

export default function CreateModulePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; image?: string; role?: string } | undefined;

  // Editor State
  const [title, setTitle] = React.useState("My New Coding Module");
  const [slug, setSlug] = React.useState("my-new-coding-module");
  const [originalSlug, setOriginalSlug] = React.useState<string | null>(null);
  const [description, setDescription] = React.useState(
    "A high-performance technical breakdown of key topics.",
  );
  const [track, setTrack] = React.useState("dsa");
  const [type, setType] = React.useState<"module" | "blog">("module");
  const [subCategorySlug, setSubCategorySlug] = React.useState("");
  const [subCategories, setSubCategories] = React.useState<{ id: string; name: string; slug: string }[]>([]);
  const [newSubCategory, setNewSubCategory] = React.useState("");
  const [isCreatingSubCat, setIsCreatingSubCat] = React.useState(false);
  const [content, setContent] = React.useState(
    `# Learning the core fundamentals

We are exploring critical software components. Below is a warning banner:

<Callout type="warning" title="Important Notice">
  Always remember to design systems in layers!
</Callout>

## Interactive Array Sorting

Step through Bubble Sort below to understand comparison patterns in actions:

<DSAVisualizer />

## Relational SQL Sandbox

Select entries from our users and orders tables below in the dynamic database shell:

<SQLPlayground />

`,
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const [placeAboveSlug, setPlaceAboveSlug] = React.useState("__BOTTOM__");
  const [existingTopics, setExistingTopics] = React.useState<{ id: string; title: string; slug: string }[]>([]);
  const [placeCategoryAboveSlug, setPlaceCategoryAboveSlug] = React.useState("__BOTTOM__");
  const [existingCategories, setExistingCategories] = React.useState<{ id: string; name: string; slug: string }[]>([]);

  // Fetch existing categories for reordering
  React.useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.ok ? r.json() : { categories: [] })
      .then((data) => {
        // Exclude the current selected track from options to avoid placing it above itself!
        const otherCategories = (data.categories || []).filter((c: { slug: string }) => c.slug !== track);
        setExistingCategories(otherCategories);
      })
      .catch(() => setExistingCategories([]));
  }, [track]);

  // Fetch existing topics in subcategory for reordering
  React.useEffect(() => {
    if (track && subCategorySlug) {
      fetch(`/api/admin/topics?categorySlug=${encodeURIComponent(track)}&subCategorySlug=${encodeURIComponent(subCategorySlug)}`)
        .then((r) => r.ok ? r.json() : { topics: [] })
        .then((data) => {
          // Exclude current topic being edited or created
          const otherTopics = (data.topics || []).filter((t: { slug: string }) => t.slug !== originalSlug && t.slug !== slug);
          setExistingTopics(otherTopics);
        })
        .catch(() => setExistingTopics([]));
    } else {
      setExistingTopics([]);
    }
  }, [track, subCategorySlug, slug, originalSlug]);

  // Fetch subcategories whenever track changes
  React.useEffect(() => {
    setSubCategorySlug("");
    setSubCategories([]);
    fetch(`/api/admin/subcategories?categorySlug=${encodeURIComponent(track)}`)
      .then((r) => r.ok ? r.json() : { subCategories: [] })
      .then((data) => {
        setSubCategories(data.subCategories || []);
        if (data.subCategories?.length > 0) {
          setSubCategorySlug(data.subCategories[0].slug);
        }
      })
      .catch(() => setSubCategories([]));
  }, [track]);

  // Inline create a new subcategory
  const handleCreateSubCategory = async () => {
    if (!newSubCategory.trim()) return;
    setIsCreatingSubCat(true);
    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubCategory.trim(), categorySlug: track }),
      });
      if (res.ok) {
        const created = await res.json();
        setSubCategories((prev) => [...prev, created]);
        setSubCategorySlug(created.slug);
        setNewSubCategory("");
      }
    } finally {
      setIsCreatingSubCat(false);
    }
  };
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const [altText, setAltText] = React.useState("Visual diagram");
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);

  // Load content if track and slug are provided in the URL query params for editing
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const trackParam = params.get("track");
      const slugParam = params.get("slug");
      if (trackParam && slugParam) {
        setOriginalSlug(slugParam);
        fetch(`/api/admin/get?track=${encodeURIComponent(trackParam)}&slug=${encodeURIComponent(slugParam)}`)
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Failed to fetch content");
          })
          .then((data) => {
            if (data && data.metadata) {
              setTitle(data.metadata.title || "");
              setSlug(data.metadata.slug || "");
              setDescription(data.metadata.description || "");
              setTrack(data.metadata.track || "dsa");
              setType(data.metadata.type || "module");
            }
            if (data && typeof data.content === "string") {
              setContent(data.content);
            }
          })
          .catch((err) => {
            console.error("Error loading content for edit:", err);
          });
      }
    }
  }, []);

  // Integrate UploadThing hook
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        const url = res[0].url;
        const name = res[0].name;
        const markdownImage = `\n![${name.split(".")[0]}](${url})\n`;

        // Insert at textarea cursor
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          setContent(
            text.substring(0, start) + markdownImage + text.substring(end),
          );
        } else {
          setContent((prev) => prev + markdownImage);
        }
        setUploadProgress(null);
        setShowImageModal(false);
      }
    },
    onUploadProgress: (p) => {
      setUploadProgress(p);
    },
    onUploadError: (error) => {
      alert(`Upload failed: ${error.message}`);
      setUploadProgress(null);
    },
  });

  // Sync slug on title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    );
  };

  // Editor toolbar actions
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + (selected || "text") + after;

    setContent(text.substring(0, start) + replacement + text.substring(end));

    // Focus back
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selected || "text").length,
      );
    }, 50);
  };

  // Real UploadThing file upload trigger
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadProgress(0);
    await startUpload([file]);
  };

  const handleInsertUrl = () => {
    if (!imageUrl) return;
    const markdownImage = `\n![${altText}](${imageUrl})\n`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      setContent(
        text.substring(0, start) + markdownImage + text.substring(end),
      );
    } else {
      setContent((prevContent) => prevContent + markdownImage);
    }

    setImageUrl("");
    setShowImageModal(false);
  };

  // Local Save trigger
  const handleSaveModule = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          track,
          type,
          content,
          subCategorySlug: subCategorySlug || undefined,
          originalSlug: originalSlug || undefined,
          placeAboveSlug: placeAboveSlug || undefined,
          placeCategoryAboveSlug: placeCategoryAboveSlug || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Module saved successfully!", {
          description: `Stored dynamically in the database.`,
        });
        router.push("/admin");
      } else {
        const err = await response.json();
        toast.error("Failed to save module", {
          description: err.message || "An unexpected error occurred.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Database connection failure", {
        description: "Could not persist module content.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-200">
      {/* Workspace Header */}
      <header className="border-b border-border bg-background px-4 py-3 flex flex-wrap justify-between items-center gap-3 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xs font-bold font-mono tracking-tight text-foreground">
              CREATOR / STUDIO
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Drafting new educational modules with real-time visual sandbox
              bindings.
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          <Select
            value={type}
            onValueChange={(val) => setType((val ?? "module") as "module" | "blog")}
          >
            <SelectTrigger className="h-10 w-36 rounded-lg border border-border bg-background px-4 text-xs font-semibold hover:bg-muted/50 cursor-pointer">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg min-w-[144px]">
              <SelectItem value="module" className="text-xs font-semibold cursor-pointer py-2 px-3">
                Module
              </SelectItem>
              <SelectItem value="blog" className="text-xs font-semibold cursor-pointer py-2 px-3">
                Blog Post
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleSaveModule}
            disabled={isSaving || !slug}
            className="h-10 rounded-lg bg-foreground px-5 text-xs font-semibold text-background hover:bg-foreground/90 flex items-center gap-2 cursor-pointer"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Module"}</span>
          </Button>

          <ThemeToggle />

          {/* Profile + Logout */}
          <div className="h-6 w-px bg-border" />
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name || "Admin"}
              className="h-7 w-7 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
              {user?.name?.charAt(0) || "A"}
            </div>
          )}
          <span className="text-xs font-semibold text-foreground hidden sm:block truncate max-w-[100px]">
            {user?.name || "Admin"}
          </span>
          <button
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="h-10 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Module Configuration Metadata Panel */}
      <div className="border-b border-border bg-muted/5 px-6 py-4 flex flex-col md:flex-row gap-4 shrink-0 select-none">
        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            Module Title
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="E.g., Graph Breadth-First Search"
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="w-full md:w-64 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            URL Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="graph-bfs"
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        {/* Category (Track) */}
        <div className="w-full md:w-48 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            Category
          </label>
          <Select
            value={track}
            onValueChange={(val) => setTrack(val ?? "dsa")}
          >
            <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:bg-muted/50 cursor-pointer">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg min-w-[180px]">
              <SelectItem value="dsa" className="text-sm font-semibold cursor-pointer py-2 px-3">DSA</SelectItem>
              <SelectItem value="system-design" className="text-sm font-semibold cursor-pointer py-2 px-3">System Design</SelectItem>
              <SelectItem value="oops" className="text-sm font-semibold cursor-pointer py-2 px-3">OOPs</SelectItem>
              <SelectItem value="sql" className="text-sm font-semibold cursor-pointer py-2 px-3">SQL</SelectItem>
              <SelectItem value="blogs" className="text-sm font-semibold cursor-pointer py-2 px-3">Blogs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Place Category Above Dropdown */}
        <div className="w-full md:w-56 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            Place Category Above (Reorder)
          </label>
          <Select value={placeCategoryAboveSlug} onValueChange={(val) => setPlaceCategoryAboveSlug(val ?? "__BOTTOM__")}>
            <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:bg-muted/50 cursor-pointer">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg min-w-[200px]">
              <SelectItem value="__BOTTOM__" className="text-sm font-semibold cursor-pointer py-2 px-3">
                [Bottom of List - Default]
              </SelectItem>
              <SelectItem value="__TOP__" className="text-sm font-semibold cursor-pointer py-2 px-3">
                [First / Top of List]
              </SelectItem>
              {existingCategories.map((c) => (
                <SelectItem key={c.id} value={c.slug} className="text-sm font-semibold cursor-pointer py-2 px-3">
                  Above: {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SubCategory */}
        <div className="w-full md:w-52 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            Sub-Category
          </label>
          {subCategories.length > 0 ? (
            <Select value={subCategorySlug} onValueChange={(val) => setSubCategorySlug(val ?? "")}>
              <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:bg-muted/50 cursor-pointer">
                <SelectValue placeholder="Select sub-category" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg min-w-[200px]">
                {subCategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.slug} className="text-sm font-semibold cursor-pointer py-2 px-3">
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 rounded-lg border border-dashed border-border bg-muted/20 px-3 flex items-center">
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          )}
        </div>

        {/* New SubCategory inline creator */}
        <div className="w-full md:w-52 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            + New Sub-Category
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newSubCategory}
              onChange={(e) => setNewSubCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSubCategory()}
              placeholder="e.g. Trees"
              className="flex-1 h-10 min-w-0 rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={handleCreateSubCategory}
              disabled={isCreatingSubCat || !newSubCategory.trim()}
              className="h-10 px-3 rounded-lg bg-foreground text-background text-xs font-bold hover:bg-foreground/90 disabled:opacity-50 transition-colors shrink-0"
            >
              {isCreatingSubCat ? "..." : "Add"}
            </button>
          </div>
        </div>

        {/* Place Above Topic Dropdown */}
        <div className="w-full md:w-60 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            Place Above Topic (Reorder)
          </label>
          <Select value={placeAboveSlug} onValueChange={(val) => setPlaceAboveSlug(val ?? "__BOTTOM__")}>
            <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:bg-muted/50 cursor-pointer">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg min-w-[240px]">
              <SelectItem value="__BOTTOM__" className="text-sm font-semibold cursor-pointer py-2 px-3">
                [Bottom of List - Default]
              </SelectItem>
              <SelectItem value="__TOP__" className="text-sm font-semibold cursor-pointer py-2 px-3">
                [First / Top of List]
              </SelectItem>
              {existingTopics.map((topic) => (
                <SelectItem key={topic.id} value={topic.slug} className="text-sm font-semibold cursor-pointer py-2 px-3">
                  Above: {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-[2] space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
            Brief Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short visual review of BFS operations..."
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Editor & Live Preview Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side: Markdown Editor */}
        <div className="w-1/2 flex flex-col border-r border-border h-full">
          {/* Editor Toolbar */}
          <div className="bg-muted/10 border-b border-border px-3 py-1.5 flex items-center gap-1 shrink-0 select-none overflow-x-auto">
            <button
              onClick={() => insertText("## ", "")}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Heading"
            >
              <HugeiconsIcon icon={HeadingIcon} className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertText("**", "**")}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground font-bold transition-all text-xs"
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => insertText("`", "`")}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Inline Code"
            >
              <HugeiconsIcon icon={CodeIcon} className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertText("- ", "")}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Bullet List"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() =>
                insertText(
                  "\n| Column 1 | Column 2 |\n|---|---|\n| Value 1 | Value 2 |\n",
                )
              }
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Insert Table"
            >
              <HugeiconsIcon icon={GridIcon} className="h-3.5 w-3.5" />
            </button>
            <div className="h-4 w-px bg-border mx-1" />
            <button
              onClick={() =>
                insertText(
                  '<Callout type="info" title="Tip">\n  ',
                  "\n</Callout>",
                )
              }
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Insert Callout"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => insertText("<DSAVisualizer />\n")}
              className="px-2 py-0.5 rounded border border-border text-[9px] font-mono hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Embed Array Sorter"
            >
              [DSA-Widget]
            </button>
            <button
              onClick={() => insertText("<SQLPlayground />\n")}
              className="px-2 py-0.5 rounded border border-border text-[9px] font-mono hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Embed SQL Sandbox"
            >
              [SQL-Widget]
            </button>
            <div className="h-4 w-px bg-border mx-1" />
            <button
              onClick={() => setShowImageModal(true)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 text-[10px] font-medium"
              title="Insert Image"
            >
              <HugeiconsIcon
                icon={ImageAdd02Icon}
                className="h-3.5 w-3.5 text-foreground"
              />
              <span>Image</span>
            </button>
          </div>

          {/* Core Text Editor Textarea */}
          <div className="flex-1 relative bg-muted/5">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-6 bg-transparent font-mono text-xs md:text-sm text-foreground resize-none focus:outline-none select-text leading-relaxed"
              style={{ tabSize: 2 }}
            />
          </div>
        </div>

        {/* Right Side: Live MDX Preview */}
        <div className="w-1/2 flex flex-col h-full bg-background overflow-y-auto p-8 select-text">
          <div className="pb-4 border-b border-border mb-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              <span>{track}</span>
              <span>•</span>
              <span>{type} Preview</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1.5 font-sans">
              {title || "Untitled Module"}
            </h1>
            <p className="text-sm text-muted-foreground font-light mt-1.5 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Compiled Output pane */}
          <div className="flex-1 prose dark:prose-invert max-w-none">
            {renderMdxClientSide(content)}
          </div>
        </div>
      </div>

      {/* Image Uploader Overlay Dialog */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <HugeiconsIcon icon={ImageAdd02Icon} className="h-4 w-4" />
                Insert Image Asset
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>

            {/* Option 2: Drag and Drop Simulated Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                Option 1: Upload Local Image
              </label>
              <div className="border border-dashed border-border rounded-lg bg-muted/20 p-6 flex flex-col items-center justify-center relative hover:bg-muted/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadProgress !== null}
                />
                <HugeiconsIcon
                  icon={Upload02Icon}
                  className="h-6 w-6 text-muted-foreground mb-2"
                />
                <span className="text-xs font-semibold text-foreground">
                  Click or Drag Image File
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  PNG, JPG, SVG up to 5MB
                </span>

                {uploadProgress !== null && (
                  <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center px-6">
                    <span className="text-xs font-mono font-semibold text-foreground mb-1.5">
                      Uploading Image... {uploadProgress}%
                    </span>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                      <div
                        style={{ width: `${uploadProgress}%` }}
                        className="h-full bg-foreground transition-all duration-150"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center my-3">
              <div className="h-px bg-border flex-1" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase px-3 select-none">
                Or
              </span>
              <div className="h-px bg-border flex-1" />
            </div>

            {/* Option 1: Paste Remote URL */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Option 2: Image Web URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/assets/diagram.png"
                  className="w-full h-8 rounded border border-border bg-background px-3 text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Image Alternate Text (Alt)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="E.g., Sliding window visualization chart"
                  className="w-full h-8 rounded border border-border bg-background px-3 text-xs focus:outline-none"
                />
              </div>

              <Button
                onClick={handleInsertUrl}
                disabled={!imageUrl}
                className="w-full h-9 rounded bg-foreground text-[11px] font-medium text-background hover:bg-foreground/90 flex items-center justify-center gap-1"
              >
                <HugeiconsIcon icon={ImageAdd02Icon} className="h-3.5 w-3.5" />
                <span>Insert Web Image Link</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
