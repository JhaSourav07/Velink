// src/components/interactive-simulator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Link2, Sparkles, Copy, Check, Loader2, ArrowRight, Shield, Globe, Zap } from "lucide-react";
import Link from "next/link";

export function InteractiveSimulator() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "generating" | "finalizing" | "success">("idle");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const statusMessages = {
    idle: "",
    connecting: "Connecting to edge routing network...",
    generating: "Generating secure alphanumeric slug...",
    finalizing: "Optimizing redirection paths...",
    success: "Success! Short URL generated at Edge Node.",
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus("connecting");

    setTimeout(() => {
      setStatus("generating");
    }, 800);

    setTimeout(() => {
      setStatus("finalizing");
    }, 1600);

    setTimeout(() => {
      const generatedSlug = slug.trim()
        ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "")
        : Math.random().toString(36).substring(2, 8);
      
      const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, "");
      const host = typeof window !== "undefined" ? window.location.host : "velink.dev";
      setShortUrl(`${host}/${generatedSlug}`);
      setStatus("success");
    }, 2400);
  };

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(`http://${shortUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setUrl("");
    setSlug("");
    setStatus("idle");
    setShortUrl("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 md:p-8 shadow-[0_0_50px_rgba(255,255,255,0.02)] overflow-hidden">
        {/* Decorative absolute background glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-500/5 blur-[120px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-zinc-500/10" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-zinc-500/5 blur-[120px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-zinc-500/10" />

        {status === "idle" && (
          <form onSubmit={handleSimulate} className="space-y-5 relative z-10">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                Try the Simulator
              </h3>
              <p className="text-zinc-500 text-xs">
                Simulate how our high-performance global network redirects your traffic instantly.
              </p>
            </div>

            <div className="space-y-4">
              {/* Destination URL */}
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 h-14 focus-within:border-white/20 focus-within:bg-white/[0.06] transition-all">
                <Link2 className="w-5 h-5 text-zinc-600 shrink-0" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long destination URL (e.g., https://github.com/sourav/velink)"
                  className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600"
                />
              </div>

              {/* Custom Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-4 h-14 focus-within:border-white/20 focus-within:bg-white/[0.06] transition-all">
                  <span className="text-zinc-600 text-sm font-medium shrink-0">velink.dev /</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="custom-slug"
                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600"
                  />
                </div>
                
                <button
                  type="submit"
                  className="h-14 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-lg"
                >
                  Shorten & Test <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}

        {status !== "idle" && status !== "success" && (
          <div className="h-44 flex flex-col items-center justify-center space-y-4 relative z-10">
            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
            <div className="text-center">
              <p className="text-white text-sm font-medium animate-pulse">{statusMessages[status]}</p>
              <p className="text-zinc-600 text-xs mt-1">Configuring edge nodes globally...</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 relative z-10 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                Ready to Go!
              </h3>
              <p className="text-zinc-500 text-xs">
                Your shortened link has been simulated. Check out the redirection preview below.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 overflow-hidden">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Short URL</p>
                  <p className="text-white text-sm font-semibold truncate">{shortUrl}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="h-10 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors flex items-center gap-2 text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-4 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors flex items-center gap-2 text-xs font-semibold shadow-md"
                  >
                    Test Redirect
                  </a>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500/70" /> SSL Active
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500/70" /> Anycast Edge Node
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500/70" /> &lt; 50ms latency
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleReset}
                className="text-xs font-medium text-zinc-500 hover:text-white transition-colors"
              >
                ← Shorten another URL
              </button>
              <Link
                href="/login"
                className="text-xs font-medium text-white flex items-center gap-1 hover:underline group"
              >
                Track live analytics in dashboard <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
