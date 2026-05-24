import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug");

    if (!categorySlug) {
      return NextResponse.json(
        { message: "Missing required query param: categorySlug" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        subCategories: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ subCategories: [] });
    }

    return NextResponse.json({ subCategories: category.subCategories });
  } catch (error) {
    console.error("Subcategories API error:", error);
    return NextResponse.json({ subCategories: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, categorySlug } = body;

    if (!name || !categorySlug) {
      return NextResponse.json(
        { message: "Missing required fields: name and categorySlug" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.subCategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug } },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const maxOrder = await prisma.subCategory.aggregate({
      where: { categoryId: category.id },
      _max: { order: true },
    });

    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        slug,
        categoryId: category.id,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(subCategory);
  } catch (error) {
    console.error("Create subcategory error:", error);
    return NextResponse.json(
      { message: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}
