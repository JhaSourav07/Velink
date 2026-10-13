// src/features/workspace/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getUserWorkspaces() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: session.user.id },
      include: {
        workspace: {
          include: {
            _count: {
              select: { links: true, members: true, domains: true },
            },
          },
        },
      },
      orderBy: { workspace: { createdAt: "asc" } },
    });

    const cookieStore = await cookies();
    const activeWorkspaceId = cookieStore.get("velink_workspace_id")?.value;

    return {
      success: true,
      workspaces: memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        role: m.role,
        linkCount: m.workspace._count.links,
        memberCount: m.workspace._count.members,
        domainCount: m.workspace._count.domains,
        isActive: activeWorkspaceId ? m.workspace.id === activeWorkspaceId : false,
      })),
      activeId: activeWorkspaceId || memberships[0]?.workspaceId || null,
    };
  } catch (error) {
    console.error("Get User Workspaces Error:", error);
    return { error: "Failed to fetch workspaces" };
  }
}

export async function createWorkspace(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length < 2) {
      return { error: "Workspace name must be at least 2 characters." };
    }

    // Slug generation
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug || "workspace"}-${randomSuffix}`;

    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Set active workspace cookie
    const cookieStore = await cookies();
    cookieStore.set("velink_workspace_id", newWorkspace.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
    });

    revalidatePath("/dashboard");
    return { success: true, workspace: newWorkspace };
  } catch (error) {
    console.error("Create Workspace Error:", error);
    return { error: "Failed to create workspace." };
  }
}

export async function switchActiveWorkspace(workspaceId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId },
    });

    if (!membership) return { error: "You are not a member of this workspace." };

    const cookieStore = await cookies();
    cookieStore.set("velink_workspace_id", workspaceId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Switch Workspace Error:", error);
    return { error: "Failed to switch workspace." };
  }
}

export async function updateWorkspace(workspaceId: string, formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId },
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return { error: "You don't have permission to update this workspace." };
    }

    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length < 2) {
      return { error: "Workspace name must be at least 2 characters." };
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update Workspace Error:", error);
    return { error: "Failed to update workspace." };
  }
}

export async function inviteWorkspaceMember(workspaceId: string, formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId },
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return { error: "You do not have permission to invite members." };
    }

    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const roleInput = (formData.get("role") as string) || "MEMBER";
    const role = roleInput === "ADMIN" ? "ADMIN" : "MEMBER";

    if (!email) return { error: "Email is required." };

    // Find user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return { error: `No user found with email "${email}". Ask them to sign up to Velink first.` };
    }

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: { userId: invitedUser.id, workspaceId },
    });

    if (existingMember) {
      return { error: "This user is already a member of this workspace." };
    }

    await prisma.workspaceMember.create({
      data: {
        userId: invitedUser.id,
        workspaceId,
        role,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Invite Member Error:", error);
    return { error: "Failed to invite member." };
  }
}

export async function removeWorkspaceMember(workspaceId: string, memberId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const currentUserMembership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId },
    });

    if (!currentUserMembership || currentUserMembership.role !== "OWNER") {
      return { error: "Only workspace owners can remove members." };
    }

    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember) return { error: "Member not found." };
    if (targetMember.userId === session.user.id) {
      return { error: "You cannot remove yourself as workspace owner." };
    }

    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Remove Member Error:", error);
    return { error: "Failed to remove member." };
  }
}

export async function deleteWorkspace(workspaceId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId },
    });

    if (!membership || membership.role !== "OWNER") {
      return { error: "Only the workspace owner can delete the workspace." };
    }

    // Check if user has at least one other workspace
    const allMemberships = await prisma.workspaceMember.findMany({
      where: { userId: session.user.id },
    });

    if (allMemberships.length <= 1) {
      return { error: "You cannot delete your only workspace." };
    }

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    // Switch active cookie to another workspace
    const remaining = allMemberships.find((m) => m.workspaceId !== workspaceId);
    if (remaining) {
      const cookieStore = await cookies();
      cookieStore.set("velink_workspace_id", remaining.workspaceId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete Workspace Error:", error);
    return { error: "Failed to delete workspace." };
  }
}
