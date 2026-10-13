// src/components/dashboard-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { 
  Link2, 
  BarChart3, 
  Globe, 
  Settings, 
  LogOut, 
  Menu, 
  X,
} from "lucide-react";
import { useState } from "react";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";

type NavProps = {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  workspaceName: string;
  workspaceId?: string;
};

interface NavItem {
  name: string;
  href: string;
  icon: typeof Link2;
}

const navItems: NavItem[] = [
  { name: "Links", href: "/dashboard", icon: Link2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Custom Domains", href: "/dashboard/domains", icon: Globe },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavLinkList({
  pathname,
  onItemClick,
}: {
  pathname: string;
  onItemClick?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative group ${
              isActive
                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            {isActive && (
              <span className="absolute left-0 w-1 h-4 bg-white rounded-r-full" />
            )}
            
            <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-300 ${
              isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
            }`} />
            
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function DashboardNav({
  userName,
  userEmail,
  userImage,
  workspaceName,
  workspaceId,
}: NavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* 1. Mobile Header & Toggle */}
      <header className="md:hidden fixed top-0 inset-x-0 h-16 bg-black/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">Velink</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 2. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 fixed inset-y-0 left-0 bg-[#070707] border-r border-white/5 py-8 px-6 z-30">
        <div className="space-y-6">
          {/* Logo & Header */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-all duration-300 relative shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Link2 className="w-4.5 h-4.5 text-white transition-transform group-hover:rotate-45 duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                Velink
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Link Infrastructure</span>
            </div>
          </Link>

          {/* Interactive Workspace Switcher */}
          <WorkspaceSwitcher
            currentWorkspaceName={workspaceName}
            currentWorkspaceId={workspaceId}
          />

          {/* Navigation Links */}
          <NavLinkList pathname={pathname} />
        </div>

        {/* User profile & sign out */}
        <div className="border-t border-white/5 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-9 h-9 rounded-xl border border-white/10 shadow-lg shrink-0 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center text-xs font-extrabold shadow-lg shrink-0">
                {getInitials(userName)}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate leading-tight">{userName}</p>
              <p className="text-zinc-500 text-[10px] truncate leading-tight mt-0.5">{userEmail}</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/15 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 3. Mobile Navigation Drawer (Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/90 backdrop-blur-md z-30 pt-20 px-6 flex flex-col justify-between pb-8 animate-in fade-in duration-200">
          <div className="space-y-6">
            <WorkspaceSwitcher
              currentWorkspaceName={workspaceName}
              currentWorkspaceId={workspaceId}
            />
            <NavLinkList
              pathname={pathname}
              onItemClick={() => setMobileMenuOpen(false)}
            />
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <div className="flex items-center gap-3">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-9 h-9 rounded-xl border border-white/10 shadow-lg object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center text-xs font-extrabold shadow-lg shrink-0">
                  {getInitials(userName)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-white text-xs font-bold truncate leading-tight">{userName}</p>
                <p className="text-zinc-500 text-[10px] truncate leading-tight mt-0.5">{userEmail}</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/15 text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
