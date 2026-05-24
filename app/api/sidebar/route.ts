import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("track");

    if (!categorySlug) {
      return NextResponse.json(
        { message: "Missing required query param: track" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        subCategories: {
          orderBy: { order: "asc" },
          include: {
            contents: {
              where: { published: true },
              orderBy: { order: "asc" },
              select: { title: true, slug: true },
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ groups: [] });
    }

    const groups = category.subCategories.map((sub) => ({
      title: sub.name,
      items: sub.contents.map((c) => ({ title: c.title, slug: c.slug })),
    }));

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Sidebar API error:", error);
    return NextResponse.json({ groups: [] }, { status: 500 });
  }
}
