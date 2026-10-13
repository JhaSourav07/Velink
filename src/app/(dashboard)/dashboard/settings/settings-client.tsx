// src/app/(dashboard)/dashboard/settings/settings-client.tsx
"use client";

import { useState, useTransition } from "react";
import {
  User,
  Users,
  Building,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Shield,
  Crown,
} from "lucide-react";
import {
  updateWorkspace,
  inviteWorkspaceMember,
  removeWorkspaceMember,
  deleteWorkspace,
} from "@/features/workspace/actions";
import { handleActionError } from "@/lib/safe-action";

interface MemberItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isCurrentUser: boolean;
}

interface SettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  members: MemberItem[];
  isOwner: boolean;
  isAdminOrOwner: boolean;
}

export function SettingsClient({
  user,
  workspace,
  members,
  isOwner,
  isAdminOrOwner,
}: SettingsClientProps) {
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Delete modal state
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleUpdateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setErrorStatus(null);

    const formData = new FormData();
    formData.set("name", workspaceName);

    startTransition(async () => {
      try {
        const res = await updateWorkspace(workspace.id, formData);
        if (res.error) {
          setErrorStatus(res.error);
        } else {
          setSaveStatus("Workspace name updated successfully!");
          setTimeout(() => setSaveStatus(null), 3000);
        }
      } catch (err) {
        setErrorStatus(handleActionError(err));
      }
    });
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMessage(null);
    setInviteError(null);

    const formData = new FormData();
    formData.set("email", inviteEmail);
    formData.set("role", inviteRole);

    startTransition(async () => {
      try {
        const res = await inviteWorkspaceMember(workspace.id, formData);
        if (res.error) {
          setInviteError(res.error);
        } else {
          setInviteEmail("");
          setInviteMessage("Member added to workspace!");
          setTimeout(() => setInviteMessage(null), 3000);
          window.location.reload();
        }
      } catch (err) {
        setInviteError(handleActionError(err));
      }
    });
  };

  const handleRemoveMember = (memberId: string) => {
    startTransition(async () => {
      try {
        const res = await removeWorkspaceMember(workspace.id, memberId);
        if (res.error) {
          alert(res.error);
        } else {
          window.location.reload();
        }
      } catch (err) {
        alert(handleActionError(err));
      }
    });
  };

  const handleDeleteWorkspace = () => {
    setDeleteError(null);
    startTransition(async () => {
      try {
        const res = await deleteWorkspace(workspace.id);
        if (res.error) {
          setDeleteError(res.error);
        } else {
          window.location.href = "/dashboard";
        }
      } catch (err) {
        setDeleteError(handleActionError(err));
      }
    });
  };

  return (
    <div className="space-y-10">
      {/* 1. User Profile Section */}
      <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
          <User className="w-5 h-5 text-zinc-400" />
          <h2 className="text-base font-bold text-white">Your Profile</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
            {user.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.substring(0, 2).toUpperCase()
            )}
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-white">{user.name}</p>
            <p className="text-zinc-500 text-sm">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Authenticated Session
            </span>
          </div>
        </div>
      </section>

      {/* 2. Workspace General Settings */}
      <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
          <Building className="w-5 h-5 text-zinc-400" />
          <h2 className="text-base font-bold text-white">Workspace Details</h2>
        </div>

        <form onSubmit={handleUpdateWorkspace} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Workspace Name</label>
            <input
              type="text"
              required
              disabled={!isAdminOrOwner || isPending}
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 h-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Workspace Slug</label>
            <input
              type="text"
              readOnly
              value={workspace.slug}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3.5 h-11 text-sm text-zinc-500 font-mono outline-none cursor-not-allowed"
            />
            <p className="text-[11px] text-zinc-600">The slug uniquely identifies your workspace.</p>
          </div>

          {isAdminOrOwner && (
            <button
              type="submit"
              disabled={isPending || workspaceName === workspace.name}
              className="h-10 px-5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
            </button>
          )}

          {saveStatus && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> {saveStatus}
            </p>
          )}
          {errorStatus && <p className="text-xs text-red-400">{errorStatus}</p>}
        </form>
      </section>

      {/* 3. Team Members */}
      <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-zinc-400" />
            <h2 className="text-base font-bold text-white">Workspace Members</h2>
          </div>
          <span className="text-xs text-zinc-500 font-medium">{members.length} members</span>
        </div>

        {/* Invite Form */}
        {isAdminOrOwner && (
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 h-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 h-11 text-xs text-zinc-300 outline-none cursor-pointer"
            >
              <option value="MEMBER" className="bg-zinc-900 text-white">Member</option>
              <option value="ADMIN" className="bg-zinc-900 text-white">Admin</option>
            </select>
            <button
              type="submit"
              disabled={isPending || !inviteEmail}
              className="h-11 px-5 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Invite</>}
            </button>
          </form>
        )}

        {inviteMessage && (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {inviteMessage}
          </p>
        )}
        {inviteError && <p className="text-xs text-red-400">{inviteError}</p>}

        {/* Members List */}
        <div className="divide-y divide-white/5">
          {members.map((member) => (
            <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                  {member.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    {member.name}
                    {member.isCurrentUser && (
                      <span className="text-[10px] text-zinc-500 font-normal">(You)</span>
                    )}
                  </p>
                  <p className="text-zinc-500 text-xs">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  member.role === "OWNER"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : member.role === "ADMIN"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-white/5 text-zinc-400 border border-white/10"
                }`}>
                  {member.role === "OWNER" ? <Crown className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                  {member.role}
                </span>

                {isOwner && !member.isCurrentUser && member.role !== "OWNER" && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={isPending}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Danger Zone (Delete Workspace) */}
      {isOwner && (
        <section className="bg-red-500/[0.02] border border-red-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-red-400">Danger Zone</h2>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Permanently delete <span className="text-white font-semibold">&ldquo;{workspace.name}&rdquo;</span> along with all associated shortened links, custom domains, and click telemetry. This action cannot be reversed.
          </p>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="h-10 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold"
            >
              Delete Workspace
            </button>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-red-400 font-semibold">
                Are you absolutely sure you want to delete this workspace?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="h-9 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkspace}
                  disabled={isPending}
                  className="h-9 px-4 rounded-xl bg-red-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-red-700 transition-colors"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Yes, Delete Workspace"}
                </button>
              </div>
              {deleteError && <p className="text-xs text-red-400 mt-2">{deleteError}</p>}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
