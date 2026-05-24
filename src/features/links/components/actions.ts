// src/features/links/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // Import the hashing library

export async function createShortLink(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized. Please log in." };

    const destinationUrl = formData.get("url") as string;
    let customSlug = formData.get("slug") as string;
    
    // Extract the new advanced fields
    const password = formData.get("password") as string;
    const expiresAtRaw = formData.get("expiresAt") as string;

    if (!destinationUrl) return { error: "Destination URL is required." };

    try { new URL(destinationUrl); } 
    catch { return { error: "Please enter a valid destination URL." }; }

    // Resolve Workspace
    let workspaceMembership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true }
    });

    if (!workspaceMembership) {
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: "Personal",
          slug: `personal-${session.user.id.substring(0, 8)}`,
          members: { create: { userId: session.user.id, role: "OWNER" } }
        }
      });
      workspaceMembership = { workspace: newWorkspace } as any;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const defaultDomain = new URL(appUrl).hostname;

    if (!customSlug) {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      customSlug = Array.from({ length: 6 }).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    } else {
      customSlug = customSlug.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    }

    const existingLink = await prisma.link.findUnique({
      where: { domain_slug: { domain: defaultDomain, slug: customSlug } }
    });

    if (existingLink) return { error: "This custom slug is already taken. Try another." };

    // --- NEW LOGIC: Hash Password & Parse Date ---
    let hashedPassword = null;
    if (password && password.trim().length > 0) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let expiresAt = null;
    if (expiresAtRaw) {
      expiresAt = new Date(expiresAtRaw);
      // Validate that the date is in the future
      if (expiresAt < new Date()) {
        return { error: "Expiration date must be in the future." };
      }
    }

    // Save to Database
    await prisma.link.create({
      data: {
        url: destinationUrl,
        slug: customSlug,
        domain: defaultDomain,
        workspaceId: workspaceMembership!.workspace.id,
        password: hashedPassword,
        expiresAt: expiresAt,
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Link Creation Error:", error);
    return { error: "An unexpected error occurred while creating the link." };
  }
}