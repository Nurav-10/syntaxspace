import { NextRequest, NextResponse } from "next/server";
import { saveModuleContent } from "@/lib/content";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  // ────────────────────────────────────────────────────────────────────────────

  try {
    const body = await req.json();
    const { title, slug, description, track, type, content, subCategorySlug, originalSlug, placeAboveSlug, placeCategoryAboveSlug } = body;

    if (!title || !slug || !track || !content) {
      return NextResponse.json(
        { message: "Missing required fields: title, slug, track, and content are required." },
        { status: 400 }
      );
    }

    const safeSlug = slug.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().trim();
    const safeTrack = track.replace(/[^a-z0-9-]+/gi, "").toLowerCase().trim();
    const safeSubCategory = subCategorySlug
      ? subCategorySlug.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().trim()
      : undefined;

    const success = await saveModuleContent(safeTrack, safeSlug, {
      title,
      description: description || "",
      type: type || "module",
      content,
      subCategorySlug: safeSubCategory,
      authorId: session.user.id,
      originalSlug: originalSlug ? String(originalSlug).trim() : undefined,
      placeAboveSlug: placeAboveSlug ? String(placeAboveSlug).trim() : undefined,
      placeCategoryAboveSlug: placeCategoryAboveSlug ? String(placeCategoryAboveSlug).trim() : undefined,
    });

    if (success) {
      return NextResponse.json({ success: true, message: "Module saved successfully." });
    } else {
      return NextResponse.json(
        { message: "Failed to save content to database." },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("API error in save-module:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
