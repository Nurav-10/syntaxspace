import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://syntaxspace.com";

  // Fetch all categories (tracks) from DB
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // Fetch all published contents (topics) from DB
  const contents = await prisma.content.findMany({
    where: {
      published: true,
    },
    select: {
      slug: true,
      updatedAt: true,
      subCategory: {
        select: {
          category: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  // Base routes for the sitemap
  const sitemaps: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Add category (track) paths
  categories.forEach((category) => {
    sitemaps.push({
      url: `${baseUrl}/learn/${category.slug}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  // Add individual content (topic) paths
  contents.forEach((content) => {
    const trackSlug = content.subCategory?.category?.slug;
    if (trackSlug) {
      sitemaps.push({
        url: `${baseUrl}/learn/${trackSlug}/${content.slug}`,
        lastModified: content.updatedAt ? new Date(content.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  });

  return sitemaps;
}
