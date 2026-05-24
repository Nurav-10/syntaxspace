import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function promoteIfAdmin(userId: string, email: string) {
  const adminEmails = getAdminEmails();
  if (adminEmails.includes(email.toLowerCase())) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),

  // ── Social OAuth providers ───────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  // ── Custom user fields ───────────────────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },

  // ── Auto-promote admin on EVERY sign-in (not just first signup) ──────────
  // This handles:
  //   • First-time OAuth sign-up (user.create)
  //   • Returning users whose ADMIN_EMAILS was set after their first login (session.create)
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await promoteIfAdmin(user.id, user.email);
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Fetch the user and promote if their email matches ADMIN_EMAILS
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
          });
          if (user && user.role !== "admin") {
            await promoteIfAdmin(user.id, user.email);
          }
          return { data: session };
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,
  },
});

export type Session = typeof auth.$Infer.Session;
