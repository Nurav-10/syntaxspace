import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

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

  // Ensure Gemini API Key is configured
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          "Gemini API key is not configured. Please add GEMINI_API_KEY='your-key' to your my-app/.env file.",
      },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();
    const { topic, track, promptDetail, activeComponents } = body;

    if (!topic) {
      return NextResponse.json(
        { message: "Missing required field: topic is required." },
        { status: 400 },
      );
    }

    // Initialize LangChain Gemini model
    // Using gemini-1.5-pro for deep reasoning on MDX code structure or gemini-1.5-flash as fallback
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-3.5-flash",
      apiKey: apiKey,
      temperature: 0.7,
      maxOutputTokens: 10000,
    });

    // Provide the AI with rich instructions explaining all custom components in detail
    const mdxComponentsContextPrompt = `
You are an expert technical curriculum designer at SyntaxSpace.
Your task is to write high-quality, professional, and interactive learning modules in MDX (Markdown) format.
You have access to 5 custom interactive React components that are bound and parsed dynamically inside the user's workspace.
You MUST write valid MDX utilizing these components where appropriate to make the module extremely engaging and practical.

---
### CUSTOM MDX COMPONENTS SPECIFICATION

1. **CALLOUT BOXES (<Callout>)**
   - **Purpose:** Used to highlight important tips, warnings, errors, or informational notes.
   - **Attributes:**
     - \`type\`: Must be exactly one of: "info", "tip", "warning", "danger".
     - \`title\`: A concise header string.
   - **Example Syntax:**
     \`\`\`md
     <Callout type="tip" title="Pro Performance Tip">
       Always index foreign keys in database schemas to prevent sequential scans on large tables!
     </Callout>
     \`\`\`

2. **CODE TABS (<CodeTabs>)**
   - **Purpose:** Used to show code implementations side-by-side in multiple languages (e.g. TS, Python, C++).
   - **Structure:** Inside the \`<CodeTabs>\` block, place standard markdown fenced code blocks. The parser automatically extracts headers.
   - **Example Syntax:**
     \`\`\`md
     <CodeTabs>
     \`\`\`ts
     const sum = (a: number, b: number): number => a + b;
     \`\`\`
     \`\`\`python
     def sum(a: int, b: int) -> int:
         return a + b
     \`\`\`
     </CodeTabs>
     \`\`\`

3. **STEP TIMELINES (<Steps> & <Step>)**
   - **Purpose:** Used to lay out linear procedures, workflows, algorithms, or setup instructions.
   - **Structure:** A single parent \`<Steps>\` containing multiple child \`<Step>\` elements.
   - **Step Attributes:**
     - \`number\`: String identifier (typically "1", "2", "3", etc.).
     - \`title\`: Title of the step.
     - \`subtitle\` (optional): Extra small text.
   - **Example Syntax:**
     \`\`\`md
     <Steps>
     <Step number="1" title="Define the model schema" subtitle="Prisma Setup">
       Add your model declaration to the \`schema.prisma\` file.
     </Step>
     <Step number="2" title="Run Database Migrations" subtitle="CLI Command">
       Run \`npx prisma migrate dev\` in your terminal shell.
     </Step>
     </Steps>
     \`\`\`

---
### WRITING PRINCIPLES
- Do NOT repeat the frontmatter or metadata. Start directly with the module title heading (\`# Topic Name\`).
- Ensure all MDX tags are perfectly closed. Avoid nested tag syntax errors.
- Never write standard markdown headers inside \`<Step>\` or \`<Callout>\` components. Keep styling clean and premium.
- Make the content educational, code-heavy, professional, and state-of-the-art.
- Make sure to use normal text for writing algorithm \`\`\`txt \`\`\` format and for wriring code use java,cpp and javascript.
- IMPORTANT: DO NOT wrap the overall MDX response in markdown, mdx, or text code fences (e.g. do not wrap with \`\`\`mdx or \`\`\` at the beginning or end of your response). Output raw MDX directly.
`;

    // Filter requested active components for custom instructions
    const activeComponentsGuide =
      activeComponents && activeComponents.length > 0
        ? `Ensure you definitely include the following custom components in your generation: ${activeComponents.map((c: string) => `\`<${c}>\``).join(", ")}.`
        : "Incorporate Callouts, CodeTabs, Steps, DSAVisualizer, and SQLPlayground naturally where appropriate based on the topic.";

    const categoryGuide = track
      ? `This module belongs to the "${track}" track. Structure your code snippets and theoretical context to align with this subject.`
      : "";

    const userInstructions = `
Topic: ${topic}
Additional Instructions: ${promptDetail || "Provide a comprehensive, high-quality walkthrough of this topic."}
${categoryGuide}
${activeComponentsGuide}

Write a premium, beautiful, and fully fleshed-out MDX curriculum file for this topic. Include clear explanations, deep technical details, and code blocks using the specified React components where appropriate. Do not include frontmatter blocks.
`;

    const stream = await model.stream([
      { role: "system", content: mdxComponentsContextPrompt },
      { role: "user", content: userInstructions },
    ]);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text =
              typeof chunk.content === "string"
                ? chunk.content
                : JSON.stringify(chunk.content);
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error("Stream generation error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("API error in generate-module:", error);
    return NextResponse.json(
      {
        message: "Internal server error during content generation.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
