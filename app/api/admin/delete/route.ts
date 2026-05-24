import { NextRequest, NextResponse } from "next/server";
import { deleteModuleContent } from "@/lib/content";
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
    const { track, slug } = body;

    if (!track || !slug) {
      return NextResponse.json(
        { message: "Missing required fields: track and slug are required." },
        { status: 400 }
      );
    }

    const safeSlug = slug.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().trim();
    const safeTrack = track.replace(/[^a-z0-9-]+/gi, "").toLowerCase().trim();

    const success = await deleteModuleContent(safeTrack, safeSlug);

    if (success) {
      return NextResponse.json({ success: true, message: "Module deleted successfully." });
    } else {
      return NextResponse.json(
        { message: "Module not found or could not be deleted." },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    console.error("API error in delete-module:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
