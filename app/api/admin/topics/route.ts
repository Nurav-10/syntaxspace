import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const categorySlug = searchParams.get("categorySlug");
    const subCategorySlug = searchParams.get("subCategorySlug");

    if (!categorySlug || !subCategorySlug) {
      return NextResponse.json(
        { message: "Missing required query params: categorySlug and subCategorySlug" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json({ topics: [] });
    }

    const subCategory = await prisma.subCategory.findFirst({
      where: {
        categoryId: category.id,
        slug: subCategorySlug,
      },
      include: {
        contents: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            order: true,
          },
        },
      },
    });

    if (!subCategory) {
      return NextResponse.json({ topics: [] });
    }

    return NextResponse.json({ topics: subCategory.contents });
  } catch (error) {
    console.error("Topics API error:", error);
    return NextResponse.json({ topics: [] }, { status: 500 });
  }
}
