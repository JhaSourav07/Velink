// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Link } from "lucide-react";

// GitHub brand icon removed from lucide-react in v0.429.0
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false);

  const handleGithubLogin = async () => {
    setIsPending(true);
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard", // Redirects to dashboard after successful login
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black selection:bg-white/30 text-white relative overflow-hidden">
      {/* Subtle Background Glow for a premium feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-sm px-8 py-10 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 shadow-2xl">
            <Link className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Welcome to Velink
          </h1>
          <p className="text-sm text-zinc-400 text-center">
            Sign in to your account to manage your links and workspaces.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleGithubLogin}
            disabled={isPending}
            className="flex items-center justify-center gap-3 w-full bg-white text-black h-11 rounded-lg font-medium transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GithubIcon className="w-5 h-5" />
            )}
            Continue with GitHub
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500">
          By continuing, you agree to Velink's Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}