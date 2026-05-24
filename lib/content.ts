import { prisma } from "@/lib/prisma";

export interface ContentMetadata {
  title: string;
  description: string;
  track: string; // category slug, e.g. "dsa"
  subCategory?: string; // subCategory slug, e.g. "sorting"
  slug: string;
  type?: "module" | "blog";
  lastModified?: string;
  wordCount?: number;
  published?: boolean;
}

export interface ContentPayload {
  metadata: ContentMetadata;
  content: string;
}

// Load a specific content item by category (track) slug and content slug
export async function getModuleContent(
  track: string,
  slug: string,
): Promise<ContentPayload | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: track },
    });

    if (!category) return null;

    const content = await prisma.content.findFirst({
      where: {
        slug,
        subCategory: {
          categoryId: category.id,
        },
      },
      include: {
        subCategory: {
          select: { slug: true, name: true },
        },
      },
    });

    if (!content) return null;

    return {
      metadata: {
        title: content.title,
        description: content.description,
        track,
        subCategory: content.subCategory.slug,
        slug: content.slug,
        type: (content.type as "module" | "blog") || "module",
        lastModified: content.lastModified,
        wordCount: content.wordCount,
        published: content.published,
      },
      content: content.content,
    };
  } catch (error) {
    console.error(`Error loading content for ${track}/${slug}:`, error);
    return null;
  }
}

// List all published content items across all tracks
export async function getAllModules(): Promise<ContentMetadata[]> {
  try {
    const contents = await prisma.content.findMany({
      include: {
        subCategory: {
          include: {
            category: { select: { slug: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return contents.map((c) => ({
      title: c.title,
      description: c.description,
      track: c.subCategory.category.slug,
      subCategory: c.subCategory.slug,
      slug: c.slug,
      type: (c.type as "module" | "blog") || "module",
      lastModified: c.lastModified,
      wordCount: c.wordCount,
      published: c.published,
    }));
  } catch (error) {
    console.error("Error loading all modules:", error);
    return [];
  }
}

// Save or update a content item
export async function saveModuleContent(
  track: string,
  slug: string,
  payload: {
    title: string;
    description: string;
    content: string;
    type?: "module" | "blog";
    subCategorySlug?: string;
    authorId?: string;
    originalSlug?: string;
    placeAboveSlug?: string;
    placeCategoryAboveSlug?: string;
  },
): Promise<boolean> {
  try {
    // Resolve or create the category
    let category = await prisma.category.findUnique({ where: { slug: track } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: track
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          slug: track,
        },
      });
    }

    if (!category) {
      return false;
    }

    // Determine the category order target
    let categoryOrder = (category as unknown as { order: number }).order;
    if (payload.placeCategoryAboveSlug) {
      if (payload.placeCategoryAboveSlug === "__TOP__") {
        categoryOrder = 0;
        await (prisma.category.updateMany as unknown as (args: Record<string, unknown>) => Promise<unknown>)({
          where: {
            slug: { not: category.slug },
          },
          data: {
            order: { increment: 1 },
          },
        });
      } else if (payload.placeCategoryAboveSlug !== "__BOTTOM__") {
        const targetCategory = await prisma.category.findUnique({
          where: { slug: payload.placeCategoryAboveSlug },
        });
        if (targetCategory) {
          categoryOrder = (targetCategory as unknown as { order: number }).order;
          await (prisma.category.updateMany as unknown as (args: Record<string, unknown>) => Promise<unknown>)({
            where: {
              order: { gte: categoryOrder },
              slug: { not: category.slug },
            },
            data: {
              order: { increment: 1 },
            },
          });
        }
      } else {
        const maxCategory = await prisma.category.findFirst({
          orderBy: { order: "desc" } as unknown as Record<string, unknown>,
        });
        categoryOrder = maxCategory ? (maxCategory as unknown as { order: number }).order + 1 : 0;
      }

      // Update the category's order in the DB
      category = await (prisma.category.update as unknown as (args: Record<string, unknown>) => Promise<unknown>)({
        where: { id: category.id },
        data: { order: categoryOrder },
      }) as Exclude<typeof category, null>;
    }

    if (!category) {
      return false;
    }

    // Resolve or create the sub-category
    const subCategorySlug = payload.subCategorySlug || "general";
    let subCategory = await prisma.subCategory.findUnique({
      where: {
        categoryId_slug: { categoryId: category.id, slug: subCategorySlug },
      },
    });
    if (!subCategory) {
      subCategory = await prisma.subCategory.create({
        data: {
          name:
            subCategorySlug.charAt(0).toUpperCase() + subCategorySlug.slice(1),
          slug: subCategorySlug,
          categoryId: category.id,
        },
      });
    }

    const wordCount = payload.content.split(/\s+/).filter(Boolean).length;
    const dateString = new Date().toISOString().split("T")[0];

    // Determine the query slug key
    const lookupSlug = payload.originalSlug || slug;

    // Retrieve the existing record inside this category by slug
    const existingContent = await prisma.content.findFirst({
      where: {
        slug: lookupSlug,
        subCategory: {
          categoryId: category.id,
        },
      },
    });

    // Determine the new order target
    let targetOrder = existingContent ? (existingContent as unknown as { order: number }).order : 0;

    if (payload.placeAboveSlug) {
      if (payload.placeAboveSlug === "__TOP__") {
        targetOrder = 0;
        // Shift all other contents in this subcategory up
        await (prisma.content.updateMany as unknown as (args: Record<string, unknown>) => Promise<unknown>)({
          where: {
            subCategoryId: subCategory.id,
            slug: { not: existingContent ? existingContent.slug : slug },
          },
          data: {
            order: { increment: 1 },
          },
        });
      } else if (payload.placeAboveSlug !== "__BOTTOM__") {
        const targetContent = await prisma.content.findFirst({
          where: {
            subCategoryId: subCategory.id,
            slug: payload.placeAboveSlug,
          },
        });
        if (targetContent) {
          targetOrder = (targetContent as unknown as { order: number }).order;
          // Shift all contents with order >= targetOrder up by 1
          await (prisma.content.updateMany as unknown as (args: Record<string, unknown>) => Promise<unknown>)({
            where: {
              subCategoryId: subCategory.id,
              order: { gte: targetOrder },
              slug: { not: existingContent ? existingContent.slug : slug },
            },
            data: {
              order: { increment: 1 },
            },
          });
        }
      } else {
        // "__BOTTOM__" or fallback: place at bottom
        const maxContent = await prisma.content.findFirst({
          where: { subCategoryId: subCategory.id },
          orderBy: { order: "desc" } as unknown as Record<string, unknown>,
        });
        targetOrder = maxContent ? (maxContent as unknown as { order: number }).order + 1 : 0;
      }
    } else if (!existingContent) {
      // New content and no placeAboveSlug: place at bottom
      const maxContent = await prisma.content.findFirst({
        where: { subCategoryId: subCategory.id },
        orderBy: { order: "desc" } as unknown as Record<string, unknown>,
      });
      targetOrder = maxContent ? (maxContent as unknown as { order: number }).order + 1 : 0;
    }

    if (existingContent) {
      // Update by unique internal ID, allowing changes to slug, subcategory, title, etc.
      await (prisma.content.update as unknown as (args: Record<string, unknown>) => Promise<unknown>)({
        where: { id: existingContent.id },
        data: {
          title: payload.title,
          slug,
          description: payload.description,
          content: payload.content,
          type: payload.type || "module",
          wordCount,
          lastModified: dateString,
          subCategoryId: subCategory.id,
          authorId: payload.authorId || null,
          order: targetOrder,
        },
      });
    } else {
      // Insert new content
      await (prisma.content.create as unknown as (args: Record<string, unknown>) => Promise<unknown>)({
        data: {
          title: payload.title,
          slug,
          description: payload.description,
          content: payload.content,
          type: payload.type || "module",
          wordCount,
          lastModified: dateString,
          subCategoryId: subCategory.id,
          authorId: payload.authorId || null,
          order: targetOrder,
        },
      });
    }

    return true;
  } catch (error) {
    console.error(`Error saving content ${track}/${slug}:`, error);
    return false;
  }
}

// Delete a content item
export async function deleteModuleContent(
  track: string,
  slug: string,
): Promise<boolean> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: track },
    });
    if (!category) return false;

    const content = await prisma.content.findFirst({
      where: {
        slug,
        subCategory: { categoryId: category.id },
      },
    });

    if (!content) return false;

    await prisma.content.delete({ where: { id: content.id } });
    return true;
  } catch (error) {
    console.error(`Error deleting content ${track}/${slug}:`, error);
    return false;
  }
}

// Re-export legacy utilities
export { parseFrontmatter } from "@/lib/content-utils";
