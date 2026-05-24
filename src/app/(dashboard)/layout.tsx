// src/app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
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

  // 2. Resolve Workspace Context
  let workspaceMembership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true }
  });

  // Gracefully generate a default personal workspace if they don't have one
  if (!workspaceMembership) {
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: "Personal Workspace",
        slug: `personal-${session.user.id.substring(0, 8)}`,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER"
          }
        }
      }
    });
    
    workspaceMembership = {
      id: "temp",
      role: "OWNER",
      userId: session.user.id,
      workspaceId: newWorkspace.id,
      workspace: newWorkspace
    } as any;
  }

  const workspaceName = workspaceMembership!.workspace.name;

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
        workspaceName={workspaceName}
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
