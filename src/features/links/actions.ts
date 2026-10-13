// src/features/links/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Helper to resolve the user's active workspace
async function resolveWorkspace(userId: string) {
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("velink_workspace_id")?.value;

  if (activeWorkspaceId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId, workspaceId: activeWorkspaceId },
      include: { workspace: true },
    });
    if (membership) return membership.workspace;
  }

  // Fallback to first workspace
  const firstMembership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
  });

  if (firstMembership) return firstMembership.workspace;

  // Create default "Personal" workspace if none exists
  return prisma.workspace.create({
    data: {
      name: "Personal",
      slug: `personal-${userId.substring(0, 8)}`,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });
}

export async function createShortLink(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized. Please log in." };

    const destinationUrl = (formData.get("url") as string)?.trim();
    let customSlug = (formData.get("slug") as string)?.trim();
    const selectedDomain = (formData.get("domain") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();
    const expiresAtRaw = formData.get("expiresAt") as string;

    if (!destinationUrl) return { error: "Destination URL is required." };

    try {
      new URL(destinationUrl);
    } catch {
      return { error: "Please enter a valid destination URL (e.g. https://example.com)." };
    }

    const workspace = await resolveWorkspace(session.user.id);

    // Resolve target domain
    const rawUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    let defaultDomain = "localhost";
    try {
      const formatted = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
      defaultDomain = new URL(formatted).hostname;
    } catch {
      defaultDomain = "localhost";
    }
    let targetDomain = defaultDomain;
    let customDomainId: string | undefined = undefined;

    if (selectedDomain && selectedDomain !== defaultDomain) {
      // Validate that this domain belongs to the workspace and is verified
      const verifiedDomain = await prisma.domain.findFirst({
        where: { domain: selectedDomain, workspaceId: workspace.id, verified: true },
      });
      if (verifiedDomain) {
        targetDomain = verifiedDomain.domain;
        customDomainId = verifiedDomain.id;
      }
    }

    // Slug generation or sanitization
    if (!customSlug) {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let isUnique = false;
      while (!isUnique) {
        customSlug = Array.from({ length: 6 })
          .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
          .join("");

        const existing = await prisma.link.findUnique({
          where: { domain_slug: { domain: targetDomain, slug: customSlug } },
        });
        if (!existing) isUnique = true;
      }
    } else {
      customSlug = customSlug.replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase();
      if (customSlug.length < 2) {
        return { error: "Custom slug must be at least 2 characters long." };
      }

      // Check collision
      const existing = await prisma.link.findUnique({
        where: { domain_slug: { domain: targetDomain, slug: customSlug } },
      });
      if (existing) {
        return { error: "This slug is already taken on this domain. Please choose another." };
      }
    }

    // Password hashing
    let hashedPassword: string | null = null;
    if (password && password.length > 0) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Expiration date
    let expiresAt: Date | null = null;
    if (expiresAtRaw) {
      expiresAt = new Date(expiresAtRaw);
      if (expiresAt <= new Date()) {
        return { error: "Expiration date must be in the future." };
      }
    }

    const createdLink = await prisma.link.create({
      data: {
        url: destinationUrl,
        slug: customSlug,
        domain: targetDomain,
        workspaceId: workspace.id,
        domainId: customDomainId,
        password: hashedPassword,
        expiresAt,
      },
    });

    // Populate Redis cache for instant first redirect (non-fatal if cache is unavailable)
    try {
      const cacheKey = `link:${targetDomain}:${customSlug}`;
      await redis.set(
        cacheKey,
        {
          id: createdLink.id,
          url: createdLink.url,
          hasPassword: Boolean(hashedPassword),
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
          archived: false,
        },
        { ex: 86400 }
      );
    } catch (cacheErr) {
      console.warn("Non-fatal Redis cache write error during createShortLink:", cacheErr);
    }

    revalidatePath("/dashboard");
    return { success: true, slug: customSlug };
  } catch (error) {
    console.error("Link Creation Error:", error);
    return { error: "An unexpected error occurred while creating the link." };
  }
}

export async function updateShortLink(linkId: string, formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized. Please log in." };

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: { workspace: { include: { members: true } } },
    });

    if (!link) return { error: "Link not found." };

    const isMember = link.workspace.members.some((m) => m.userId === session.user.id);
    if (!isMember) return { error: "Unauthorized access to this link." };

    const destinationUrl = (formData.get("url") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();
    const clearPassword = formData.get("clearPassword") === "true";
    const expiresAtRaw = formData.get("expiresAt") as string;
    const clearExpiry = formData.get("clearExpiry") === "true";

    if (!destinationUrl) return { error: "Destination URL cannot be empty." };
    try {
      new URL(destinationUrl);
    } catch {
      return { error: "Please enter a valid destination URL." };
    }

    let updatedPassword = link.password;
    if (clearPassword) {
      updatedPassword = null;
    } else if (password && password.length > 0) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    let updatedExpiry = link.expiresAt;
    if (clearExpiry) {
      updatedExpiry = null;
    } else if (expiresAtRaw) {
      const parsed = new Date(expiresAtRaw);
      if (parsed <= new Date()) {
        return { error: "Expiration date must be in the future." };
      }
      updatedExpiry = parsed;
    }

    const updated = await prisma.link.update({
      where: { id: linkId },
      data: {
        url: destinationUrl,
        password: updatedPassword,
        expiresAt: updatedExpiry,
      },
    });

    // Update Redis cache (non-fatal)
    try {
      const cacheKey = `link:${updated.domain}:${updated.slug}`;
      await redis.set(
        cacheKey,
        {
          id: updated.id,
          url: updated.url,
          hasPassword: Boolean(updated.password),
          expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null,
          archived: updated.archived,
        },
        { ex: 86400 }
      );
    } catch (cacheErr) {
      console.warn("Non-fatal Redis cache write error during updateShortLink:", cacheErr);
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update Link Error:", error);
    return { error: "Failed to update the link." };
  }
}

export async function toggleArchiveLink(linkId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: { workspace: { include: { members: true } } },
    });

    if (!link) return { error: "Link not found." };
    const isMember = link.workspace.members.some((m) => m.userId === session.user.id);
    if (!isMember) return { error: "Unauthorized." };

    const updated = await prisma.link.update({
      where: { id: linkId },
      data: { archived: !link.archived },
    });

    // Update or clear Redis cache (non-fatal)
    try {
      const cacheKey = `link:${updated.domain}:${updated.slug}`;
      await redis.set(
        cacheKey,
        {
          id: updated.id,
          url: updated.url,
          hasPassword: Boolean(updated.password),
          expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null,
          archived: updated.archived,
        },
        { ex: 86400 }
      );
    } catch (cacheErr) {
      console.warn("Non-fatal Redis cache write error during toggleArchiveLink:", cacheErr);
    }

    revalidatePath("/dashboard");
    return { success: true, archived: updated.archived };
  } catch (error) {
    console.error("Toggle Archive Error:", error);
    return { error: "Failed to update archive status." };
  }
}

export async function deleteShortLink(linkId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: { workspace: { include: { members: true } } },
    });

    if (!link) return { error: "Link not found." };
    const isMember = link.workspace.members.some((m) => m.userId === session.user.id);
    if (!isMember) return { error: "Unauthorized." };

    // Remove from database (cascades to clicks)
    await prisma.link.delete({ where: { id: linkId } });

    // Evict from Redis cache (non-fatal)
    try {
      const cacheKey = `link:${link.domain}:${link.slug}`;
      await redis.del(cacheKey);
    } catch (cacheErr) {
      console.warn("Non-fatal Redis cache eviction error during deleteShortLink:", cacheErr);
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete Link Error:", error);
    return { error: "Failed to delete link." };
  }
}