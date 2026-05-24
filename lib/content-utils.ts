export interface ContentMetadata {
  title: string;
  description: string;
  track: string;
  slug: string;
  type?: "module" | "blog";
  lastModified?: string;
  wordCount?: number;
}

export interface ContentPayload {
  metadata: ContentMetadata;
  content: string;
}

// Custom high-performance frontmatter parser
export function parseFrontmatter(rawContent: string): { metadata: Record<string, string>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---/;
  const match = rawContent.match(frontmatterRegex);

  const metadata: Record<string, string> = {};
  let content = rawContent;

  if (match) {
    const yamlBlock = match[1];
    content = rawContent.slice(match[0].length).trim();

    yamlBlock.split("\n").forEach((line) => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(":").trim().replace(/^['"]|['"]$/g, "");
        metadata[key] = value;
      }
    });
  }

  return { metadata, content };
}
