// src/features/links/components/create-link-form.tsx
"use client";

import { useState } from "react";
import { createShortLink } from "../actions";
import { Link2, Sparkles, Loader2, Settings2, Lock, Calendar } from "lucide-react";

export function CreateLinkForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await createShortLink(formData);

    if (result.error) {
      setError(result.error);
    } else {
      (event.target as HTMLFormElement).reset();
      setShowAdvanced(false); // Hide advanced options on success
    }
    
    setIsPending(false);
  }

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-1 relative overflow-hidden group shadow-2xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/10 to-zinc-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <form onSubmit={onSubmit} className="relative z-10 flex flex-col gap-2 bg-black rounded-xl p-2">
        
        {/* Main Input Row */}
        <div className="flex flex-col md:flex-row gap-2">
          {/* Destination URL */}
          <div className="flex-1 flex items-center bg-white/5 rounded-lg border border-white/5 focus-within:border-white/20 focus-within:bg-white/10 transition-colors px-3 h-12">
            <Link2 className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
            <input
              type="url"
              name="url"
              required
              placeholder="https://your-long-url.com/very/long/path"
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          {/* Custom Slug */}
          <div className="w-full md:w-48 flex items-center bg-white/5 rounded-lg border border-white/5 focus-within:border-white/20 focus-within:bg-white/10 transition-colors px-3 h-12">
            <span className="text-zinc-500 text-sm mr-1">/</span>
            <input
              type="text"
              name="slug"
              placeholder="custom-slug"
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          {/* Settings Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-12 w-12 flex items-center justify-center rounded-lg border transition-colors shrink-0 ${
              showAdvanced ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="h-12 px-6 rounded-lg bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Shorten</>}
          </button>
        </div>

        {/* Advanced Settings Drawer (Now using CSS hidden instead of unmounting) */}
        <div 
          className={`flex-col sm:flex-row gap-4 p-3 mt-1 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200 ${
            showAdvanced ? "flex" : "hidden"
          }`}
        >
          {/* Password Input */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Password Protection
            </label>
            <input
              type="password"
              name="password"
              placeholder="Leave blank for public link"
              className="w-full bg-white/5 border border-white/5 focus:border-white/20 focus:bg-white/10 transition-colors px-3 h-9 rounded-md text-sm text-white placeholder:text-zinc-600 outline-none"
            />
          </div>

          {/* Expiration Date Input */}
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Expiration Date
            </label>
            <input
              type="datetime-local"
              name="expiresAt"
              className="w-full bg-white/5 border border-white/5 focus:border-white/20 focus:bg-white/10 transition-colors px-3 h-9 rounded-md text-sm text-white outline-none [color-scheme:dark]"
            />
          </div>
        </div>
      </form>

      {error && (
        <div className="absolute -bottom-8 left-0 text-red-400 text-xs px-4">
          {error}
        </div>
      )}
    </div>
  );
}