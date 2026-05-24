import * as React from "react";
import { Navigation } from "@/components/Navigation";
import { NestedSidebar } from "@/components/NestedSidebar";
import { TableOfContents } from "@/components/TableOfContents";

interface LearnLayoutProps {
  children: React.ReactNode;
  params: Promise<{ track: string }>;
}

export default async function LearnLayout({
  children,
  params,
}: LearnLayoutProps) {
  const { track } = await params;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Persisted Top Navigation Header */}
      <Navigation />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto self-center">
        {/* Left-hand Collapsible Sidebar */}
        <NestedSidebar track={track} />

        {/* Center Content Reading Pane */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 md:py-10">
          <div className="max-w-3xl mx-auto">{children}</div>
        </main>

        {/* Right-hand Dynamic Scroll Tracker */}
        <TableOfContents />
      </div>
    </div>
  );
}
