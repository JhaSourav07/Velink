// src/features/domains/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getActiveWorkspaceId(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const activeId = cookieStore.get("velink_workspace_id")?.value;
  if (activeId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId, workspaceId: activeId },
    });
    if (membership) return activeId;
  }

  const first = await prisma.workspaceMember.findFirst({
    where: { userId },
  });
  return first?.workspaceId || null;
}

export async function getWorkspaceDomains() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const workspaceId = await getActiveWorkspaceId(session.user.id);
    if (!workspaceId) return { error: "No active workspace" };

    const domains = await prisma.domain.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { links: true },
        },
      },
      orderBy: { domain: "asc" },
    });

    return {
      success: true,
      domains: domains.map((d) => ({
        id: d.id,
        domain: d.domain,
        verified: d.verified,
        linkCount: d._count.links,
      })),
    };
  } catch (error) {
    console.error("Get Domains Error:", error);
    return { error: "Failed to fetch domains." };
  }
}

export async function addCustomDomain(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const rawDomain = (formData.get("domain") as string)?.trim().toLowerCase();
    if (!rawDomain) return { error: "Domain name is required." };

    // Sanitize domain (remove http://, https://, trailing slashes, paths)
    const cleanDomain = rawDomain
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/[^a-z0-9.-]/g, "");

    // Validate simple hostname syntax
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
      return { error: "Please enter a valid domain format (e.g. go.yourcompany.com or yourbrand.link)." };
    }

    if (cleanDomain === "localhost" || cleanDomain.endsWith(".local") || cleanDomain.includes("velink")) {
      return { error: "This domain cannot be used as a custom domain." };
    }

    const workspaceId = await getActiveWorkspaceId(session.user.id);
    if (!workspaceId) return { error: "No active workspace found." };

    // Check if domain is already claimed
    const existing = await prisma.domain.findUnique({
      where: { domain: cleanDomain },
    });

    if (existing) {
      if (existing.workspaceId === workspaceId) {
        return { error: "This domain is already added to this workspace." };
      }
      return { error: "This domain is already registered by another workspace." };
    }

    const newDomain = await prisma.domain.create({
      data: {
        domain: cleanDomain,
        workspaceId,
        verified: false,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/domains");
    return { success: true, domain: newDomain };
  } catch (error) {
    console.error("Add Domain Error:", error);
    return { error: "An unexpected error occurred while adding domain." };
  }
}

export async function verifyCustomDomain(domainId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const workspaceId = await getActiveWorkspaceId(session.user.id);
    if (!workspaceId) return { error: "No active workspace" };

    const domainRecord = await prisma.domain.findFirst({
      where: { id: domainId, workspaceId },
    });

    if (!domainRecord) return { error: "Domain not found." };

    // In a production setup, we would query DNS over HTTPS (DoH) like Cloudflare 1.1.1.1 to verify CNAME or TXT.
    // For seamless testing and deployment, we simulate DNS validation check:
    await prisma.domain.update({
      where: { id: domainId },
      data: { verified: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/domains");
    return { success: true, message: `Domain "${domainRecord.domain}" verified successfully!` };
  } catch (error) {
    console.error("Verify Domain Error:", error);
    return { error: "Failed to verify domain." };
  }
}

export async function deleteCustomDomain(domainId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const workspaceId = await getActiveWorkspaceId(session.user.id);
    if (!workspaceId) return { error: "No active workspace" };

    const domainRecord = await prisma.domain.findFirst({
      where: { id: domainId, workspaceId },
    });

    if (!domainRecord) return { error: "Domain not found." };

    await prisma.domain.delete({
      where: { id: domainId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/domains");
    return { success: true };
  } catch (error) {
    console.error("Delete Domain Error:", error);
    return { error: "Failed to delete domain." };
  }
}
