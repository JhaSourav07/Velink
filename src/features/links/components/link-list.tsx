// src/features/links/components/link-list.tsx
"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, BarChart2, Globe, CornerDownRight } from "lucide-react";
import Link from "next/link";

// Define the type based on our Prisma schema
type LinkItem = {
  id: string;
  domain: string;
  slug: string;
  url: string;
  createdAt: Date;
  clicks?: { id: string }[];
};

export function LinkList({ links }: { links: LinkItem[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (domain: string, slug: string, id: string) => {
    // Construct the full short URL
    const shortUrl = `${domain === "localhost" ? "http://" : "https://"}${domain}/${slug}`;
    navigator.clipboard.writeText(shortUrl);
    
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (links.length === 0) {
    return (
      <div className="h-64 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-500 text-sm bg-white/[0.02]">
        <Globe className="w-8 h-8 mb-3 opacity-20" />
        <p>Your shortened links will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {links.map((link) => (
        <div 
          key={link.id} 
          className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
        >
          {/* Link Details */}
          <div className="flex flex-col gap-1.5 overflow-hidden pr-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white text-sm flex items-center gap-1">
                {link.domain}/{link.slug}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 truncate">
              <CornerDownRight className="w-3 h-3 shrink-0" />
              <span className="truncate">{link.url}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 sm:mt-0 shrink-0">
            {/* Live Analytics Button */}
            <Link 
              href="/dashboard/analytics"
              className="h-8 px-3 flex items-center gap-2 rounded-md bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold border border-white/5 hover:border-white/10 shadow-sm"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{link.clicks?.length || 0} clicks</span>
            </Link>

            {/* Test Link Button */}
            <a 
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              title="Test original link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Copy Button */}
            <button 
              onClick={() => handleCopy(link.domain, link.slug, link.id)}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10"
              title="Copy short link"
            >
              {copiedId === link.id ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}