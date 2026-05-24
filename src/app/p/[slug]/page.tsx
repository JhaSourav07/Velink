// src/app/p/[slug]/page.tsx
"use client";

import { useState, use } from "react";
import { unlockLink } from "@/features/links/verify-password";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function PasswordChallengePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const unwrappedParams = use(params);
  const searchParams = useSearchParams();
  const domain = searchParams.get("d") || "localhost";
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("slug", unwrappedParams.slug);
    formData.append("domain", domain);

    const result = await unlockLink(formData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
    // If successful, the server action automatically redirects them, 
    // so we just let the loading spinner keep spinning.
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-white/30 relative overflow-hidden">
      {/* Premium ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6">
            <Lock className="w-5 h-5 text-zinc-300" />
          </div>
          
          <h1 className="text-xl font-semibold text-white tracking-tight mb-2 text-center">
            Protected Link
          </h1>
          <p className="text-sm text-zinc-400 text-center mb-8">
            This link is password protected. Please enter the password to continue to the destination.
          </p>

          <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
            <input
              type="password"
              name="password"
              required
              placeholder="Enter password..."
              className="w-full h-11 bg-black border border-white/10 focus:border-white/30 focus:bg-white/[0.02] transition-colors rounded-lg px-4 text-white text-sm outline-none placeholder:text-zinc-600"
            />
            
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-white text-black font-medium rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Unlock Link <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-400 text-center animate-in slide-in-from-top-1 fade-in">
              {error}
            </p>
          )}

        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600 font-medium tracking-widest uppercase">
            Powered by Velink
          </p>
        </div>
      </div>
    </div>
  );
}