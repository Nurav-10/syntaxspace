import { NextRequest, NextResponse } from "next/server";
import { getModuleContent } from "@/lib/content";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
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
    const { searchParams } = new URL(req.url);
    const track = searchParams.get("track");
    const slug = searchParams.get("slug");

    if (!track || !slug) {
      return NextResponse.json(
        { message: "Missing required query parameters: track and slug are required." },
        { status: 400 }
      );
    }

    const safeTrack = track.replace(/[^a-z0-9-]+/gi, "").toLowerCase().trim();
    const safeSlug = slug.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().trim();

    const result = await getModuleContent(safeTrack, safeSlug);

    if (!result) {
      return NextResponse.json(
        { message: "Module or blog post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error in GET module content:", error);
    return NextResponse.json(
      { message: "Internal server error reading content." },
      { status: 500 }
    );
  }
}
