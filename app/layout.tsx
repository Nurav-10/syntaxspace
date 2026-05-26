import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SearchDialog } from "@/components/SearchDialog";
import { Toaster } from "@/components/ui/sonner";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyntaxSpace - Modern Developer Learning Platform",
  description:
    "High-performance platform for DSA, System Design, OOPs, and SQL.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/ss-logo.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/ss-logo-light.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
      )}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200 selection:dark:bg-background selection:dark:text-foreground selection:bg-foreground selection:text-background"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SearchDialog />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
