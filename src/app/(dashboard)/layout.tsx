// src/app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Secure the route on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // 2. Resolve Workspace Context (Check cookie first)
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("velink_workspace_id")?.value;

  let workspaceMembership = null;
  if (activeWorkspaceId) {
    workspaceMembership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId: activeWorkspaceId },
      include: { workspace: true },
    });
  }

  if (!workspaceMembership) {
    workspaceMembership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
    });
  }

  // Gracefully generate a default personal workspace if user has none
  let currentWorkspace = workspaceMembership?.workspace;
  if (!currentWorkspace) {
    try {
      currentWorkspace = await prisma.workspace.create({
        data: {
          name: "Personal Workspace",
          slug: `personal-${session.user.id.slice(-10)}`,
          members: {
            create: {
              userId: session.user.id,
              role: "OWNER",
            },
          },
        },
      });
    } catch (err) {
      console.error("Auto-workspace creation fallback:", err);
      const fallback = await prisma.workspaceMember.findFirst({
        where: { userId: session.user.id },
        include: { workspace: true },
      });
      currentWorkspace = fallback?.workspace;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative font-sans">
      {/* Dynamic Background visual glows */}
      <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-zinc-500/[0.01] blur-[120px] rounded-full pointer-events-none z-0 animate-pulse-glow" />
      <div className="absolute bottom-[10%] left-[20%] w-[250px] h-[250px] bg-white/[0.01] blur-[100px] rounded-full pointer-events-none z-0 animate-pulse-glow" />

      {/* Responsive Sidebar Navigation */}
      <DashboardNav 
        userName={session.user.name || "User"}
        userEmail={session.user.email}
        userImage={session.user.image}
        workspaceName={currentWorkspace?.name || "Personal Workspace"}
        workspaceId={currentWorkspace?.id || ""}
      />

      {/* Main Viewport Container */}
      <main className="md:pl-64 min-h-screen pt-24 md:pt-10 pb-16 px-6 md:px-12 relative z-10 flex flex-col items-center w-full">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
