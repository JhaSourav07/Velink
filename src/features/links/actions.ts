// src/features/links/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createShortLink(formData: FormData) {
  try {
    // 1. Authenticate the request securely on the server
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized. Please log in." };
    }

    const destinationUrl = formData.get("url") as string;
    let customSlug = formData.get("slug") as string;

    if (!destinationUrl) {
      return { error: "Destination URL is required." };
    }

    // 2. Resolve Workspace Context
    // For now, we fetch or create a default workspace for the user
    let workspace = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true }
    });

    if (!workspace) {
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: "Personal",
          slug: `personal-${session.user.id.substring(0, 8)}`,
          members: {
            create: {
              userId: session.user.id,
              role: "OWNER"
            }
          }
        }
      });
      workspace = { workspace: newWorkspace } as any;
    }

    // 3. Slug Generation & Collision Detection
    // If no custom slug is provided, generate a random 6-character alphanumeric string
    if (!customSlug) {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      customSlug = Array.from({ length: 6 })
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join("");
    }

    // Sanitize the slug (remove spaces, special chars)
    customSlug = customSlug.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();

    // Check if the slug is already taken globally on the default domain
    const existingLink = await prisma.link.findUnique({
      where: {
        domain_slug: {
          domain: "velink.com", // Default domain for all links initially
          slug: customSlug,
        }
      }
    });

    if (existingLink) {
      return { error: "This custom slug is already taken. Try another." };
    }

    // 4. Save to Database
    await prisma.link.create({
      data: {
        url: destinationUrl,
        slug: customSlug,
        domain: "velink.com",
        workspaceId: workspace!.workspace.id,
      }
    });

    // 5. Trigger Next.js to refresh the dashboard data instantly
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Link Creation Error:", error);
    return { error: "An unexpected error occurred." };
  }
}