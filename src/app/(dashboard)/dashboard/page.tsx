// src/app/(dashboard)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreateLinkForm } from "@/features/links/components/create-link-form";
import { LinkList } from "@/features/links/components/link-list";
import { Link2, MousePointerClick, Activity, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

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

  // 3. Fetch all links for this workspace with their clicks count
  const links = workspaceMember 
    ? await prisma.link.findMany({
        where: { workspaceId: workspaceMember.workspaceId },
        include: {
          _count: {
            select: { clicks: true }
          }
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Derived metrics with actual live database data
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + (link._count?.clicks || 0), 0);
  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-10 animate-fade-in-up">
      
      {/* 1. Welcoming & Status Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {firstName}
          </h1>
          <p className="text-zinc-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Workspace Context: <span className="text-zinc-200 font-semibold">{workspaceMember?.workspace.name || "Personal"}</span>
          </p>
        </div>
        
        {/* Plan Upgrade / Context CTA Badge */}
        <Link
          href="#pricing"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl w-fit transition-all group"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-zinc-300 group-hover:text-white">Free Plan</span>
          <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 2. Sleek Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Active Links Metric */}
        <div className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.01] blur-[40px] rounded-full pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
              <Link2 className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Active</span>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Created Links</p>
          <p className="text-3xl font-extrabold text-white tracking-tight">{totalLinks}</p>
        </div>

        {/* Total Clicks Telemetry */}
        <Link 
          href="/dashboard/analytics"
          className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-xl transition-all duration-300 block"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] blur-[40px] rounded-full pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
              <MousePointerClick className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest flex items-center gap-1">
              Live <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
            </span>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Accumulated Clicks</p>
          <p className="text-3xl font-extrabold text-white tracking-tight">{totalClicks}</p>
        </Link>

        {/* Network & Node Status */}
        <div className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.01] blur-[40px] rounded-full pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
              <Activity className="w-4.5 h-4.5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-purple-500/80 uppercase tracking-widest">Healthy</span>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Global Routing Node</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-sm font-semibold text-white truncate">All systems fully operational</p>
          </div>
        </div>

      </div>

      {/* 3. Link Creation Module */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-zinc-500/[0.01] blur-[80px] rounded-full pointer-events-none" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-zinc-500" /> Make a Shortened Link
        </h2>
        <CreateLinkForm />
      </div>

      {/* 4. Live Link Registry Overview */}
      <div className="pt-6 border-t border-white/5 space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Workspace Links Registry</h2>
            <p className="text-zinc-500 text-xs">Manage and examine shortened URLs generated inside your personal context.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/5 shrink-0">
            {links.length} Short URLs active
          </span>
        </div>
        
        <LinkList links={links} />
      </div>

    </div>
  );
}