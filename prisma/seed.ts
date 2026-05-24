import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parseFrontmatter } from "../lib/content-utils";

const prisma = new PrismaClient();

// Mapping from directory name → display name for categories
const CATEGORY_LABELS: Record<string, string> = {
  dsa: "Data Structures & Algorithms",
  "system-design": "System Design",
  oops: "OOP Concepts",
  sql: "SQL Mastery",
  blogs: "Blogs",
};

// Default sub-category names per category
const DEFAULT_SUBCATEGORIES: Record<string, string[]> = {
  dsa: [
    "Algorithms",
    "Data Structures",
    "Sorting",
    "Searching",
    "Graphs",
    "Trees",
  ],
  "system-design": [
    "Fundamentals",
    "Storage & Caching",
    "Scalability",
    "Networking",
  ],
  oops: ["Core Principles", "Design Patterns", "SOLID Principles"],
  sql: ["Query Basics", "Joins", "Optimization", "Indexing"],
  blogs: ["Engineering", "Career", "Tutorial"],
};

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ── Step 1: Seed Categories and default SubCategories ──────────────────────
  const CONTENT_DIR = path.join(process.cwd(), "content");
  const tracks = fs.existsSync(CONTENT_DIR)
    ? fs
        .readdirSync(CONTENT_DIR)
        .filter((d) => fs.statSync(path.join(CONTENT_DIR, d)).isDirectory())
    : Object.keys(CATEGORY_LABELS);

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const label = CATEGORY_LABELS[track] || track;

    const category = await prisma.category.upsert({
      where: { slug: track },
      create: { name: label, slug: track, order: i },
      update: { name: label, order: i },
    });

    console.log(`📁 Category: ${category.name} (${track})`);

    // Seed default sub-categories
    const defaultSubs = DEFAULT_SUBCATEGORIES[track] || ["General"];
    for (let j = 0; j < defaultSubs.length; j++) {
      const subName = defaultSubs[j];
      const subSlug = subName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await prisma.subCategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: subSlug } },
        create: {
          name: subName,
          slug: subSlug,
          categoryId: category.id,
          order: j,
        },
        update: { name: subName, order: j },
      });
    }

    // ── Step 2: Import existing MDX files ────────────────────────────────────
    const trackDir = path.join(CONTENT_DIR, track);
    if (!fs.existsSync(trackDir)) continue;

    const files = fs
      .readdirSync(trackDir)
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    for (const file of files) {
      const slug = file.replace(/\.mdx?$/, "");
      const rawContent = fs.readFileSync(path.join(trackDir, file), "utf-8");
      const { metadata: rawMeta, content } = parseFrontmatter(rawContent);

      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const title = rawMeta.title || slug.replace(/-/g, " ");

      // Map to a sensible sub-category slug from frontmatter or defaults
      const subCategorySlug =
        rawMeta.subCategory ||
        (track === "dsa" ? "algorithms" : "fundamentals");
      const subCategoryName =
        subCategorySlug.charAt(0).toUpperCase() +
        subCategorySlug.slice(1).replace(/-/g, " ");

      // Ensure the sub-category exists
      const subCategory = await prisma.subCategory.upsert({
        where: {
          categoryId_slug: { categoryId: category.id, slug: subCategorySlug },
        },
        create: {
          name: subCategoryName,
          slug: subCategorySlug,
          categoryId: category.id,
          order: 99,
        },
        update: {},
      });

      await prisma.content.upsert({
        where: {
          subCategoryId_slug: { subCategoryId: subCategory.id, slug },
        },
        create: {
          title,
          slug,
          description: rawMeta.description || "",
          content,
          type:
            (rawMeta.type as "module" | "blog") ||
            (track === "blogs" ? "blog" : "module"),
          wordCount,
          lastModified:
            rawMeta.lastModified || new Date().toISOString().split("T")[0],
          subCategoryId: subCategory.id,
          published: true,
        },
        update: {
          title,
          description: rawMeta.description || "",
          content,
          wordCount,
          lastModified:
            rawMeta.lastModified || new Date().toISOString().split("T")[0],
        },
      });

      console.log(`  📄 Seeded: ${track}/${slug}  [${subCategoryName}]`);
    }
  }

  console.log(`
✅ Seed complete!

Next steps:
  1. Set ADMIN_EMAILS=your@email.com in .env
  2. Add your Google & GitHub OAuth credentials to .env
  3. Run: npm run db:migrate && npm run dev
  4. Sign in with your OAuth account → auto-promoted to admin
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
