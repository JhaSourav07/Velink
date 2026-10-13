// src/components/workspace-switcher.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Plus, Sparkles, Loader2, X } from "lucide-react";
import {
  getUserWorkspaces,
  switchActiveWorkspace,
  createWorkspace,
} from "@/features/workspace/actions";

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
  linkCount: number;
  memberCount: number;
}

export function WorkspaceSwitcher({
  currentWorkspaceName,
  currentWorkspaceId,
}: {
  currentWorkspaceName: string;
  currentWorkspaceId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    const res = await getUserWorkspaces();
    if (res.success && res.workspaces) {
      setWorkspaces(res.workspaces);
    }
    setLoading(false);
  };

  const handleToggle = () => {
    if (!open) {
      fetchWorkspaces();
    }
    setOpen(!open);
  };

  const handleSwitch = (id: string) => {
    startTransition(async () => {
      await switchActiveWorkspace(id);
      setOpen(false);
      window.location.reload();
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createWorkspace(formData);
      if (result.error) {
        setCreateError(result.error);
      } else {
        setCreateModalOpen(false);
        window.location.reload();
      }
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Button */}
      <button
        onClick={handleToggle}
        className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] rounded-xl p-3 text-left transition-all duration-200 flex items-center justify-between group"
      >
        <div className="overflow-hidden pr-2">
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Active Workspace</p>
          <p className="text-white text-xs font-semibold truncate flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {currentWorkspaceName}
          </p>
        </div>
        <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0 transition-transform" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0c0c] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Workspaces
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {workspaces.map((ws) => {
                const isSelected = ws.id === currentWorkspaceId || ws.name === currentWorkspaceName;
                return (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitch(ws.id)}
                    disabled={isPending}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? "bg-white/10 text-white font-medium"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex flex-col text-left truncate mr-2">
                      <span className="truncate">{ws.name}</span>
                      <span className="text-[10px] text-zinc-500">
                        {ws.linkCount} link{ws.linkCount === 1 ? "" : "s"} · {ws.role.toLowerCase()}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-white/5 mt-1.5 pt-1.5">
            <button
              onClick={() => {
                setOpen(false);
                setCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-400" /> New Workspace
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Workspace Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Acme Marketing, Personal Blog"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 h-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20"
                />
              </div>

              {createError && (
                <div className="text-xs text-red-400 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="h-9 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-9 px-5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
