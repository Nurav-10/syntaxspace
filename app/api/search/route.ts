import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractHeadings(content: string) {
  const lines = content.split("\n");
  const headings: { text: string; level: number; slug: string }[] = [];
  
  // Track code block states to avoid false positive matching inside code snippets
  let inCodeBlock = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    if (inCodeBlock) continue;
    
    if (trimmed.startsWith("# ")) {
      const text = trimmed.slice(2).trim();
      headings.push({ text, level: 1, slug: slugify(text) });
    } else if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3).trim();
      headings.push({ text, level: 2, slug: slugify(text) });
    } else if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).trim();
      headings.push({ text, level: 3, slug: slugify(text) });
    }
  }
  
  return headings;
}

export async function GET() {
  try {
    const contents = await prisma.content.findMany({
      where: { published: true },
      include: {
        subCategory: {
          include: {
            category: { select: { slug: true, name: true } },
          },
        },
      },
    });

    const searchIndex = contents.map((c) => {
      const trackSlug = c.subCategory.category.slug;
      const trackName = c.subCategory.category.name;
      const subCategorySlug = c.subCategory.slug;
      const subCategoryName = c.subCategory.name;

      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description || "",
        track: trackSlug,
        trackName,
        subCategory: subCategorySlug,
        subCategoryName,
        headings: extractHeadings(c.content),
      };
    });

    return NextResponse.json({ items: searchIndex });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
