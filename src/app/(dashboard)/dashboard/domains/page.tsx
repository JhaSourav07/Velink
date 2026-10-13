// src/app/(dashboard)/dashboard/domains/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Globe,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  getWorkspaceDomains,
  addCustomDomain,
  verifyCustomDomain,
  deleteCustomDomain,
} from "@/features/domains/actions";

interface DomainItem {
  id: string;
  domain: string;
  verified: boolean;
  linkCount: number;
}

export default function CustomDomainsPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const refreshDomains = async () => {
    const res = await getWorkspaceDomains();
    if (res.success && res.domains) {
      setDomains(res.domains);
    }
  };

  useEffect(() => {
    let ignore = false;
    getWorkspaceDomains().then((res) => {
      if (!ignore && res.success && res.domains) {
        setDomains(res.domains);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleAddDomain = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddError(null);
    setVerifyMessage(null);

    const formData = new FormData();
    formData.set("domain", newDomain);

    startTransition(async () => {
      const res = await addCustomDomain(formData);
      if (res.error) {
        setAddError(res.error);
      } else {
        setNewDomain("");
        refreshDomains();
      }
    });
  };

  const handleVerify = (domainId: string) => {
    setVerifyMessage(null);
    startTransition(async () => {
      const res = await verifyCustomDomain(domainId);
      if (res.success) {
        setVerifyMessage(res.message || "Domain verified successfully!");
        refreshDomains();
      } else {
        setAddError(res.error || "Failed to verify domain.");
      }
    });
  };

  const handleDelete = (domainId: string) => {
    startTransition(async () => {
      await deleteCustomDomain(domainId);
      refreshDomains();
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Globe className="w-7 h-7 text-white" />
            Custom Domains
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Connect branded domains (e.g. <span className="text-zinc-300 font-mono">link.acme.com</span>) to maximize brand trust and click-through rates.
          </p>
        </div>
      </div>

      {/* Add Domain Form */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-zinc-500" /> Connect a New Domain
        </h2>

        <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center bg-white/5 border border-white/10 focus-within:border-white/20 focus-within:bg-white/10 transition-colors rounded-xl px-4 h-12">
            <Globe className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
            <input
              type="text"
              required
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. go.yourcompany.com or brand.link"
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !newDomain}
            className="h-12 px-6 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Domain"}
          </button>
        </form>

        {addError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {addError}
          </div>
        )}

        {verifyMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {verifyMessage}
          </div>
        )}
      </div>

      {/* DNS Configuration Instructions */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">DNS Configuration Instructions</h3>
        </div>
        <p className="text-zinc-400 text-xs leading-relaxed">
          To verify ownership and route traffic through Velink edge servers, add the following CNAME record in your domain registrar DNS settings (Cloudflare, Namecheap, GoDaddy, Route53, etc.):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Type</p>
            <p className="text-white text-xs font-mono font-semibold">CNAME</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Name / Host</p>
            <p className="text-white text-xs font-mono font-semibold">@ or sub (e.g. go)</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1 flex items-center justify-between">
            <div className="overflow-hidden mr-2">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Target / Value</p>
              <p className="text-white text-xs font-mono font-semibold truncate">cname.velink.dev</p>
            </div>
            <button
              onClick={() => copyToClipboard("cname.velink.dev", "cname")}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white shrink-0"
              title="Copy Target"
            >
              {copiedText === "cname" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Registered Workspace Domains
          </h2>
          <span className="text-xs font-medium text-zinc-500">
            {domains.length} domain{domains.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        ) : domains.length === 0 ? (
          <div className="h-48 border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center text-zinc-500 text-sm bg-white/[0.01]">
            <Globe className="w-8 h-8 mb-2 opacity-20" />
            <p>No custom domains added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {domains.map((dom) => (
              <div
                key={dom.id}
                className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold text-sm font-mono">
                      {dom.domain}
                    </span>
                    {dom.verified ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-xs">
                    {dom.linkCount} link{dom.linkCount === 1 ? "" : "s"} routing through this domain
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!dom.verified && (
                    <button
                      onClick={() => handleVerify(dom.id)}
                      disabled={isPending}
                      className="h-9 px-3.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Verify DNS
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(dom.id)}
                    disabled={isPending}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-white/5 flex items-center justify-center transition-colors"
                    title="Delete domain"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
