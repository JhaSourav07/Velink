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
  Sparkles, 
  Menu, 
  X,
  User as UserIcon
} from "lucide-react";
import { useState } from "react";

type NavProps = {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  workspaceName: string;
};

export function DashboardNav({ userName, userEmail, userImage, workspaceName }: NavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "Links", href: "/dashboard", icon: Link2, disabled: false },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, disabled: false },
    { name: "Custom Domains", href: "#", icon: Globe, disabled: true, badge: "Pro" },
    { name: "Settings", href: "#", icon: Settings, disabled: true, badge: "Pro" },
  ];

  const handleSignOut = async () => {
    await authClient.signOut({
      callbackURL: "/login",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const NavigationLinks = () => (
    <div className="space-y-1.5">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        if (link.disabled) {
          return (
            <div
              key={link.name}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-zinc-600 cursor-not-allowed select-none text-sm group"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </div>
              {link.badge && (
                <span className="text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-500">
                  {link.badge}
                </span>
              )}
            </div>
          );
        }

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative group ${
              isActive
                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            {/* Left side indicator light */}
            {isActive && (
              <span className="absolute left-0 w-1 h-4 bg-white rounded-r-full" />
            )}
            
            <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-300 ${
              isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
            }`} />
            
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );

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
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 2. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 fixed inset-y-0 left-0 bg-[#070707] border-r border-white/5 py-8 px-6 z-30">
        <div className="space-y-8">
          
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

          {/* Workspace Context Box */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-1 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-20 h-20 bg-zinc-500/[0.02] blur-[20px] rounded-full pointer-events-none" />
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Active Workspace</p>
            <p className="text-white text-xs font-semibold truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {workspaceName}
            </p>
          </div>

          {/* Navigation Anchors */}
          <NavigationLinks />
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
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-30 pt-20 px-6 flex flex-col justify-between pb-8 animate-fade-in">
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3.5">
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Active Workspace</p>
              <p className="text-white text-xs font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {workspaceName}
              </p>
            </div>
            <NavigationLinks />
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
