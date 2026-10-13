// src/app/(dashboard)/dashboard/settings/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("velink_workspace_id")?.value;

  let membership = null;
  if (activeWorkspaceId) {
    membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId: activeWorkspaceId },
      include: {
        workspace: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
      },
    });
  }

  if (!membership) {
    membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: {
        workspace: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
      },
    });
  }

  if (!membership) {
    redirect("/dashboard");
  }

  const workspace = membership.workspace;
  const isOwner = membership.role === "OWNER";
  const isAdminOrOwner = membership.role === "OWNER" || membership.role === "ADMIN";

  const memberList = workspace.members.map((m) => ({
    id: m.id,
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    role: m.role,
    isCurrentUser: m.userId === session.user.id,
  }));

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="border-b border-white/5 pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage your personal account profile, active workspace settings, and team members.
        </p>
      </div>

      <SettingsClient
        user={{
          id: session.user.id,
          name: session.user.name || "User",
          email: session.user.email,
          image: session.user.image,
        }}
        workspace={{
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          plan: workspace.plan,
        }}
        members={memberList}
        isOwner={isOwner}
        isAdminOrOwner={isAdminOrOwner}
      />
    </div>
  );
}
