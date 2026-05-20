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

    // Validate that the input is an actual URL
    try {
      new URL(destinationUrl);
    } catch {
      return { error: "Please enter a valid destination URL (e.g., https://example.com)." };
    }

    // 2. Resolve Workspace Context
    // Find the user's first workspace, or gracefully create a default "Personal" workspace
    let workspaceMembership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true }
    });

    if (!workspaceMembership) {
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
      workspaceMembership = { workspace: newWorkspace } as any;
    }

    const workspaceId = workspaceMembership!.workspace.id;

    // 3. Dynamic Domain Resolution
    // Get the base URL from the environment (localhost in dev, Vercel URL in prod)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const defaultDomain = new URL(appUrl).hostname;

    // 4. Slug Generation & Collision Detection
    if (!customSlug) {
      // Generate a random 6-character alphanumeric string
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      customSlug = Array.from({ length: 6 })
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join("");
    } else {
      // Sanitize custom slug to prevent broken URLs (lowercase, remove spaces/symbols)
      customSlug = customSlug.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    }

    // Check if the slug is already taken globally on YOUR specific active domain
    const existingLink = await prisma.link.findUnique({
      where: {
        domain_slug: {
          domain: defaultDomain, 
          slug: customSlug,
        }
      }
    });

    if (existingLink) {
      return { error: "This custom slug is already taken. Try another." };
    }

    // 5. Save to Database
    await prisma.link.create({
      data: {
        url: destinationUrl,
        slug: customSlug,
        domain: defaultDomain,
        workspaceId: workspaceId,
      }
    });

    // 6. Trigger Next.js to refresh the dashboard data instantly without a hard reload
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Link Creation Error:", error);
    return { error: "An unexpected error occurred while creating the link." };
  }
}