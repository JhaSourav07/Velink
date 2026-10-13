// src/features/links/components/link-list.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  BarChart2,
  Globe,
  CornerDownRight,
  QrCode,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
  Lock,
  Calendar,
  Search,
  Download,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import QRCodeLib from "qrcode";
import {
  deleteShortLink,
  toggleArchiveLink,
  updateShortLink,
} from "@/features/links/actions";

export type LinkItem = {
  id: string;
  domain: string;
  slug: string;
  url: string;
  password?: string | null;
  expiresAt?: Date | string | null;
  archived?: boolean;
  createdAt: Date | string;
  _count?: {
    clicks: number;
  };
};

export function LinkList({ links }: { links: LinkItem[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "archived" | "protected">("all");

  // QR Modal State
  const [qrModalLink, setQrModalLink] = useState<{ url: string; slug: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Edit Modal State
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const getFullShortUrl = (domain: string, slug: string) => {
    const isLocal = domain === "localhost" || domain.startsWith("localhost:");
    return `${isLocal ? "http://" : "https://"}${domain}/${slug}`;
  };

  const handleCopy = (domain: string, slug: string, id: string) => {
    const shortUrl = getFullShortUrl(domain, slug);
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenQR = async (domain: string, slug: string) => {
    const fullUrl = getFullShortUrl(domain, slug);
    setQrModalLink({ url: fullUrl, slug });
    try {
      const dataUrl = await QRCodeLib.toDataURL(fullUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("QR Code generation error:", err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !qrModalLink) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${qrModalLink.slug}.png`;
    a.click();
  };

  const handleToggleArchive = (id: string) => {
    startTransition(async () => {
      await toggleArchiveLink(id);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteShortLink(id);
      setDeletingId(null);
    });
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLink) return;

    setEditError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateShortLink(editingLink.id, formData);
      if (result.error) {
        setEditError(result.error);
      } else {
        setEditingLink(null);
      }
    });
  };

  // Filter links
  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "active") return !link.archived;
    if (filterTab === "archived") return !!link.archived;
    if (filterTab === "protected") return !!link.password;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80 flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by slug or destination URL..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-4 h-10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#0A0A0A] border border-white/5 rounded-xl p-1 self-stretch sm:self-auto overflow-x-auto">
          {(
            [
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "protected", label: "Protected" },
              { id: "archived", label: "Archived" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                filterTab === tab.id
                  ? "bg-white text-black font-semibold shadow"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredLinks.length === 0 ? (
        <div className="h-64 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-500 text-sm bg-white/[0.01]">
          <Globe className="w-8 h-8 mb-3 opacity-20" />
          <p>{searchQuery ? "No links match your search." : "No links in this view."}</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs text-zinc-400 hover:underline"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        /* Links List */
        <div className="flex flex-col gap-3">
          {filteredLinks.map((link) => {
            const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

            return (
              <div
                key={link.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                  link.archived
                    ? "bg-white/[0.01] border-zinc-800/40 opacity-75"
                    : isExpired
                    ? "bg-red-500/[0.02] border-red-500/20"
                    : "bg-[#0A0A0A] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                }`}
              >
                {/* Link Details */}
                <div className="flex flex-col gap-1.5 overflow-hidden pr-4 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm flex items-center gap-1 tracking-tight">
                      {link.domain}/{link.slug}
                    </span>

                    {/* Status Badges */}
                    {link.archived && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Archived
                      </span>
                    )}

                    {isExpired && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> Expired
                      </span>
                    )}

                    {link.password && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Password
                      </span>
                    )}

                    {link.expiresAt && !isExpired && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                        Expires {new Date(link.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 truncate">
                    <CornerDownRight className="w-3 h-3 shrink-0" />
                    <span className="truncate hover:text-zinc-300 transition-colors">
                      {link.url}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex items-center gap-1.5 mt-4 sm:mt-0 shrink-0 flex-wrap">
                  {/* Live Analytics Button */}
                  <Link
                    href={`/dashboard/analytics?linkId=${link.id}`}
                    className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium border border-white/5"
                    title="View Link Analytics"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>{link._count?.clicks || 0}</span>
                  </Link>

                  {/* QR Code Button */}
                  <button
                    onClick={() => handleOpenQR(link.domain, link.slug)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
                    title="Show QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(link.domain, link.slug, link.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10"
                    title="Copy short link"
                  >
                    {copiedId === link.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Test Link Button */}
                  <a
                    href={getFullShortUrl(link.domain, link.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
                    title="Visit Short Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Edit Link Button */}
                  <button
                    onClick={() => {
                      setEditingLink(link);
                      setEditError(null);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
                    title="Edit Link"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Archive Button */}
                  <button
                    onClick={() => handleToggleArchive(link.id)}
                    disabled={isPending}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
                    title={link.archived ? "Restore Link" : "Archive Link"}
                  >
                    {link.archived ? (
                      <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Delete Link Button */}
                  <button
                    onClick={() => setDeletingId(link.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/5"
                    title="Delete Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalLink && qrDataUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-base">QR Code</h3>
                <p className="text-zinc-500 text-xs mt-0.5 truncate max-w-[200px]">
                  /{qrModalLink.slug}
                </p>
              </div>
              <button
                onClick={() => setQrModalLink(null)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl flex items-center justify-center shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`QR code for ${qrModalLink.slug}`}
                className="w-56 h-56"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadQR}
                className="flex-1 h-10 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrModalLink.url);
                  setCopiedId("qr-modal");
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="h-10 px-4 rounded-xl bg-white/10 text-white font-semibold text-xs flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/10"
              >
                {copiedId === "qr-modal" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-base">Edit Short Link</h3>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {editingLink.domain}/{editingLink.slug}
                </p>
              </div>
              <button
                onClick={() => setEditingLink(null)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Destination URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Destination URL</label>
                <input
                  type="url"
                  name="url"
                  required
                  defaultValue={editingLink.url}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 h-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20"
                />
              </div>

              {/* Password Protection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Password Protection
                  </label>
                  {editingLink.password && (
                    <label className="text-[11px] text-zinc-500 flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" name="clearPassword" value="true" className="accent-white" />
                      Remove password
                    </label>
                  )}
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder={editingLink.password ? "Enter new password to change..." : "Leave blank for public"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 h-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20"
                />
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Expiration Date
                  </label>
                  {editingLink.expiresAt && (
                    <label className="text-[11px] text-zinc-500 flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" name="clearExpiry" value="true" className="accent-white" />
                      Remove expiry
                    </label>
                  )}
                </div>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  defaultValue={
                    editingLink.expiresAt
                      ? new Date(editingLink.expiresAt).toISOString().slice(0, 16)
                      : ""
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 h-11 text-sm text-white outline-none focus:border-white/20 [color-scheme:dark]"
                />
              </div>

              {editError && (
                <div className="text-xs text-red-400 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  {editError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="h-10 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-10 px-5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Delete Link?</h3>
              <p className="text-zinc-400 text-xs mt-1">
                Are you sure? This will permanently delete the shortened URL and all of its recorded click analytics.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="h-9 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isPending}
                className="h-9 px-4 rounded-xl bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-red-600 transition-colors"
              >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}