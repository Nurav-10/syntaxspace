import * as React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getAllModules } from "@/lib/content";
import { AdminClient } from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // ── Server-side session guard ────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  if ((session.user as { role?: string }).role !== "admin") {
    redirect("/learn/dsa");
  }
  // ────────────────────────────────────────────────────────────────────────

  const modules = await getAllModules();
  return <AdminClient initialModules={modules} />;
}
