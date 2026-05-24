"use client";

import * as React from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Search01Icon,
  Upload02Icon,
  ViewIcon,
  BookOpen01Icon,
  DatabaseIcon,
  WorkflowSquare01Icon,
  Settings02Icon,
  ComputerIcon,
  FileAddIcon,
  ArrowRight01Icon,
  Cancel01Icon,
  Trash2,
} from "@hugeicons/core-free-icons";

import { ContentMetadata, parseFrontmatter } from "@/lib/content-utils";
import { useSession, signOut } from "@/lib/auth-client";
import { Pencil } from "lucide-react";
import Image from "next/image";

interface AdminClientProps {
  initialModules: ContentMetadata[];
}

export function AdminClient({ initialModules }: AdminClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as
    | { name?: string; email?: string; image?: string; role?: string }
    | undefined;

  const [modules, setModules] =
    React.useState<ContentMetadata[]>(initialModules);
  const [search, setSearch] = React.useState("");
  const [trackFilter, setTrackFilter] = React.useState("all");

  // Drag and Drop Upload State
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadedDraft, setUploadedDraft] = React.useState<{
    title: string;
    description: string;
    track: string;
    slug: string;
    type: "module" | "blog";
    content: string;
  } | null>(null);

  // Custom Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = React.useState<{
    track: string;
    slug: string;
    title: string;
  } | null>(null);

  // Search & Filter evaluation
  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.description || "").toLowerCase().includes(search.toLowerCase());

    const matchesTrack = trackFilter === "all" || m.track === trackFilter;

    return matchesSearch && matchesTrack;
  });

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle Drop and Parse File
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const file = e.dataTransfer.files[0];
    if (!file.name.endsWith(".md") && !file.name.endsWith(".mdx")) {
      toast.error("Invalid file format", {
        description: "Only .md or .mdx Markdown files are supported.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      const { metadata: rawMeta, content } = parseFrontmatter(rawText);

      const fileSlug = file.name
        .replace(/\.mdx?$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      // Auto-populate draft from parsed frontmatter
      setUploadedDraft({
        title: rawMeta.title || fileSlug.replace(/-/g, " "),
        description: rawMeta.description || "Uploaded Markdown module.",
        track: rawMeta.track || "dsa",
        slug: rawMeta.slug || fileSlug,
        type: (rawMeta.type as "module" | "blog") || "module",
        content: content.trim(),
      });
    };
    reader.readAsText(file);
  };

  // Persist Drag & Drop upload
  const saveUploadedDraft = async () => {
    if (!uploadedDraft) return;

    try {
      const response = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadedDraft),
      });

      if (response.ok) {
        // Update local state list dynamically
        const newModule: ContentMetadata = {
          title: uploadedDraft.title,
          description: uploadedDraft.description,
          track: uploadedDraft.track,
          slug: uploadedDraft.slug,
          type: uploadedDraft.type,
          lastModified: new Date().toISOString().split("T")[0],
          wordCount: uploadedDraft.content.split(/\s+/).filter(Boolean).length,
        };

        setModules((prev) => [newModule, ...prev]);
        setUploadedDraft(null);
        toast.success("Module imported successfully!", {
          description: `"${uploadedDraft.title}" is now live in the directory.`,
        });
      } else {
        const err = await response.json();
        toast.error("Import failed", {
          description:
            err.message || "Failed to persist content in the database.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Database connection failure", {
        description: "Could not save the uploaded module.",
      });
    }
  };

  // Handle delete action
  const handleDeleteModule = async (
    track: string,
    slug: string,
    title: string,
  ) => {
    try {
      const response = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, slug }),
      });

      if (response.ok) {
        // Remove from state
        setModules((prev) =>
          prev.filter((m) => !(m.track === track && m.slug === slug)),
        );
        toast.success("Module deleted", {
          description: `"${title}" has been successfully removed.`,
        });
      } else {
        const err = await response.json();
        toast.error("Delete failed", {
          description: err.message || "Failed to remove content from database.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Database connection failure", {
        description: "Could not delete the module.",
      });
    }
  };

  const getTrackIcon = (track: string) => {
    switch (track) {
      case "dsa":
        return <HugeiconsIcon icon={BookOpen01Icon} className="h-3.5 w-3.5" />;
      case "sql":
        return <HugeiconsIcon icon={DatabaseIcon} className="h-3.5 w-3.5" />;
      case "system-design":
        return (
          <HugeiconsIcon icon={WorkflowSquare01Icon} className="h-3.5 w-3.5" />
        );
      case "oops":
        return <HugeiconsIcon icon={Settings02Icon} className="h-3.5 w-3.5" />;
      default:
        return <HugeiconsIcon icon={ComputerIcon} className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Monochromatic Dashboard Navigation */}
      <header className="border-b border-border bg-background px-4 h-14 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/ss-logo.svg"
              width={100}
              height={100}
              className="w-5 h-5 dark:invert"
              alt="website-logo "
            />
            <span className="font-mono text-sm font-bold tracking-tight text-foreground sm:block">
              SYNTAX
              <span className="font-sans font-light text-muted-foreground">
                SPACE
              </span>
            </span>
          </Link>
          <span className="h-4 w-px bg-border hidden sm:block" />
          <span className="text-sm font-bold font-mono  text-muted-foreground uppercase hidden sm:block">
            ADMIN CONSOLE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground mr-1 hidden sm:block"
          >
            View Site
          </Link>
          <ThemeToggle />
          <div className="h-4 w-px bg-border mx-1" />
          {/* Profile avatar */}
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name || "Admin"}
              className="h-7 w-7 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold text-muted-foreground uppercase">
              {user?.name?.charAt(0) || "A"}
            </div>
          )}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
              {user?.name || "Admin"}
            </span>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              {user?.role || "admin"}
            </span>
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="h-7 px-2.5 rounded-md border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all ml-1"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Console Frame */}
      <main className="flex-1 lg:max-w-[80vw] w-[90vw] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Side: File Upload Zone & Actions */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 select-none">
          {/* Quick Create buttons */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-1">
            <h2 className="text-lg font-bold text-foreground">
              Content Management
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create and structure high-performance technical content on your
              local system.
            </p>
            <div className="pt-4 space-y-2">
              <Link
                href="/dashboard/create"
                className="w-full h-9 rounded-md bg-foreground text-xs font-semibold text-background hover:bg-foreground/90 flex items-center justify-center gap-1.5 transition-colors"
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  size={16}
                  className="mb-0.5 font-semibold"
                />
                <span>Create New Module</span>
              </Link>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
              isDragging
                ? "border-foreground bg-accent/40 scale-[1.02]"
                : "border-border bg-card hover:bg-muted/15"
            }`}
          >
            <HugeiconsIcon
              icon={Upload02Icon}
              className="h-6 w-6 text-muted-foreground mb-3"
            />
            <span className="text-sm font-semibold text-foreground">
              Upload MDX Module
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 max-w-[200px]">
              Drag and drop any `.md` or `.mdx` file here. We will extract its
              frontmatter automatically.
            </p>
          </div>
        </div>

        {/* Right Side: Search and Data Table of modules */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Filters & Search Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules..."
                className="w-full h-9 rounded-md border border-border bg-card pl-8 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Track Tabs Filter */}
            <div className="flex bg-muted/20 border border-border p-0.5 rounded-md text-xs font-semibold text-muted-foreground overflow-x-auto w-full sm:w-auto shrink-0 select-none">
              {["all", "dsa", "system-design", "oops", "sql", "blogs"].map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setTrackFilter(t)}
                    className={`px-3 py-1.5 rounded transition-all shrink-0 uppercase ${
                      trackFilter === t
                        ? "bg-card text-foreground font-bold shadow-sm"
                        : "hover:text-foreground"
                    }`}
                  >
                    {t.replace("-", " ")}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Core Modules Data Table */}
          <div className="border border-border max-h-[75vh] rounded-xl bg-card overflow-hidden overflow-y-auto">
            {filteredModules.length === 0 ? (
              <div className="p-12 text-center select-none">
                <HugeiconsIcon
                  icon={FileAddIcon}
                  className="h-8 w-8 text-muted-foreground mx-auto mb-3"
                />
                <span className="text-xs font-semibold text-foreground">
                  No Modules Found
                </span>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try adjusting your search filters, or drop a new `.mdx` file
                  on the sidebar to get started!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto select-text">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/15 border-b border-border text-xs font-bold font-mono text-foreground/80 uppercase">
                      <th className="px-5 py-3 tracking-wider">Module Title</th>
                      <th className="px-5 py-3 tracking-wider">Track</th>
                      <th className="px-5 py-3 tracking-wider">Type</th>
                      <th className="px-5 py-3 tracking-wider">Length</th>
                      <th className="px-5 py-3 tracking-wider">Modified</th>
                      <th className="px-5 py-3 tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModules.map((m) => (
                      <tr
                        key={`${m.track}-${m.slug}`}
                        className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                      >
                        {/* Title and description */}
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-bold text-foreground block leading-tight">
                            {m.title}
                          </span>
                          <span className="text-sm text-muted-foreground line-clamp-1 mt-0.5 font-light">
                            {m.description || "No description provided."}
                          </span>
                        </td>

                        {/* Track Badge */}
                        <td className="px-5 py-3.5 select-none">
                          <span className="inline-flex  gap-1   text-xs font-mono font-medium text-foreground capitalize">
                            <span>{m.track.replace("-", " ")}</span>
                          </span>
                        </td>

                        {/* Content Type Badge */}
                        <td className="px-5 py-3.5 select-none">
                          <span
                            className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold  uppercase border ${
                              m.type === "blog"
                                ? "bg-purple-500/5 border-purple-500/20 text-purple-700 dark:text-purple-400"
                                : "bg-zinc-500/5 border-border text-zinc-700 dark:text-zinc-400"
                            }`}
                          >
                            {m.type || "module"}
                          </span>
                        </td>

                        {/* Word Length */}
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                          {m.wordCount || 0} words
                        </td>

                        {/* Modification Date */}
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                          {m.lastModified}
                        </td>

                        {/* Controls */}
                        <td className="px-5 py-3.5 text-right select-none">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Live View */}
                            <Link
                              href={`/learn/${m.track}/${m.slug}`}
                              className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              title="View Live"
                            >
                              <HugeiconsIcon
                                icon={ViewIcon}
                                className="h-3.5 w-3.5"
                              />
                            </Link>
                            {/* Edit Button */}
                            <Link
                              href={`/dashboard/create?track=${m.track}&slug=${m.slug}`}
                              className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit Content"
                            >
                              <Pencil className="h-3 w-3" />
                            </Link>
                            {/* Delete Button */}
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  track: m.track,
                                  slug: m.slug,
                                  title: m.title,
                                })
                              }
                              className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              title="Delete Module"
                            >
                              <HugeiconsIcon
                                icon={Trash2}
                                className="h-3.5 w-3.5"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Slide-in Drawer Review Modal for Dragged MDX File */}
      {uploadedDraft && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-xs font-bold font-mono text-foreground flex items-center gap-1.5">
                <HugeiconsIcon icon={FileAddIcon} className="h-4 w-4" />
                MDX FILE IMPORT REVIEW
              </h3>
              <button
                onClick={() => setUploadedDraft(null)}
                className="h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              We parsed the frontmatter of your uploaded document. Please verify
              the metadata settings below before saving.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest block">
                  Module Title
                </label>
                <input
                  type="text"
                  value={uploadedDraft.title}
                  onChange={(e) =>
                    setUploadedDraft((prev) =>
                      prev ? { ...prev, title: e.target.value } : null,
                    )
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest block">
                  Learning Track
                </label>
                <Select
                  value={uploadedDraft.track}
                  onValueChange={(val) =>
                    setUploadedDraft((prev) =>
                      prev ? { ...prev, track: val ?? "dsa" } : null,
                    )
                  }
                >
                  <SelectTrigger className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:bg-muted/50 cursor-pointer">
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg min-w-[160px]">
                    <SelectItem
                      value="dsa"
                      className="text-sm font-semibold cursor-pointer py-2 px-3"
                    >
                      DSA
                    </SelectItem>
                    <SelectItem
                      value="system-design"
                      className="text-sm font-semibold cursor-pointer py-2 px-3"
                    >
                      System Design
                    </SelectItem>
                    <SelectItem
                      value="oops"
                      className="text-sm font-semibold cursor-pointer py-2 px-3"
                    >
                      OOPs
                    </SelectItem>
                    <SelectItem
                      value="sql"
                      className="text-sm font-semibold cursor-pointer py-2 px-3"
                    >
                      SQL
                    </SelectItem>
                    <SelectItem
                      value="blogs"
                      className="text-sm font-semibold cursor-pointer py-2 px-3"
                    >
                      Blogs
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest block">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={uploadedDraft.slug}
                  onChange={(e) =>
                    setUploadedDraft((prev) =>
                      prev ? { ...prev, slug: e.target.value } : null,
                    )
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest block">
                  Description
                </label>
                <input
                  type="text"
                  value={uploadedDraft.description}
                  onChange={(e) =>
                    setUploadedDraft((prev) =>
                      prev ? { ...prev, description: e.target.value } : null,
                    )
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setUploadedDraft(null)}
                className="h-10 text-sm font-semibold rounded-lg px-4 cursor-pointer"
              >
                Discard
              </Button>
              <Button
                onClick={saveUploadedDraft}
                className="h-10 text-sm font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 px-5 flex items-center gap-2 cursor-pointer"
              >
                <span>Save and Persist File</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Polish Danger Delete Overlay Dialog Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card/90 backdrop-blur-md border  rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <HugeiconsIcon
                  icon={Trash2}
                  className="h-5 w-5 animate-pulse"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Delete Learning Module
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you absolutely sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &quot;{deleteTarget.title}&quot;
              </span>
              ? This will permanently delete the content file from your
              workspace disk and clear its records from the database.
            </p>

            <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                Target Details
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border/85 bg-background/60 text-xs font-mono font-medium text-foreground capitalize">
                  {getTrackIcon(deleteTarget.track)}
                  <span>{deleteTarget.track.replace("-", " ")}</span>
                </span>
                <span className="text-xs font-mono text-muted-foreground select-all bg-background/30 border border-border/50 rounded px-1.5 py-0.5">
                  slug: {deleteTarget.slug}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="h-9 text-xs font-semibold rounded-lg px-4 cursor-pointer hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const { track, slug, title } = deleteTarget;
                  setDeleteTarget(null);
                  await handleDeleteModule(track, slug, title);
                }}
                className="h-9 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-5 flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/10 border-0"
              >
                <HugeiconsIcon icon={Trash2} className="h-3.5 w-3.5" />
                <span>Confirm Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
