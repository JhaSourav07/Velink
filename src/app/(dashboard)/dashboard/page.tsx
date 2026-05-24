// src/app/(dashboard)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreateLinkForm } from "@/features/links/components/create-link-form";
import { LinkList } from "@/features/links/components/link-list";
import { Link2, MousePointerClick, Activity, Zap } from "lucide-react";

export default async function DashboardPage() {
  // 1. Secure the page & get the user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // 2. Fetch the user's workspace
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true }
  });

  // 3. Fetch all links for this workspace
  const links = workspaceMember 
    ? await prisma.link.findMany({
        where: { workspaceId: workspaceMember.workspaceId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Derived metrics for the dashboard overview
  const totalLinks = links.length;
  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-10 animate-fade-in-up">
      
      {/* 1. Welcome & Context Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
            Welcome back, {firstName}
          </h1>
          <p className="text-zinc-400 text-sm mt-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Workspace: <span className="text-white font-medium">{workspaceMember?.workspace.name || "Personal"}</span>
          </p>
        </div>
        
        {/* Upgrade / Pro Badge Placeholder */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full w-fit">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span className="text-xs font-medium text-zinc-300">Free Plan</span>
        </div>
      </div>

      {/* 2. Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Card 1 */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 relative overflow-hidden group shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Link2 className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm font-medium mb-1">Active Links</p>
          <p className="text-3xl font-semibold text-white tracking-tight">{totalLinks}</p>
        </div>

        {/* Stat Card 2 (Placeholder for Edge Analytics) */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 relative overflow-hidden group shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <MousePointerClick className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm font-medium mb-1">Total Clicks</p>
          <p className="text-3xl font-semibold text-white tracking-tight">0</p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 relative overflow-hidden group shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm font-medium mb-1">Network Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-sm font-medium text-white tracking-tight">All systems operational</p>
          </div>
        </div>
      </div>

      {/* 3. The Creation Engine */}
      <div className="pt-4">
        <h2 className="text-sm font-medium text-white mb-3 px-1">Create a new link</h2>
        <CreateLinkForm />
      </div>

      {/* 4. Link Data Table */}
      <div className="pt-8 border-t border-white/10">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-sm font-medium text-white">Recent Links</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10">
            Showing {links.length}
          </span>
        </div>
        
        <LinkList links={links} />
      </div>

    </div>
  );
}