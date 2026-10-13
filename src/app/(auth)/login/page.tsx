// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Link2, Mail, Lock, User, AlertCircle } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGithubLogin = async () => {
    setIsPending(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch {
      setError("Failed to initialize GitHub authentication.");
      setIsPending(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
          callbackURL: "/dashboard",
        });

        if (signUpError) {
          setError(signUpError.message || "Sign up failed. Please try again.");
          setIsPending(false);
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/dashboard",
        });

        if (signInError) {
          setError(signInError.message || "Invalid email or password.");
          setIsPending(false);
          return;
        }
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Authentication failed. Please check your credentials.");
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black selection:bg-white/30 text-white relative overflow-hidden p-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              {mode === "signin" ? "Welcome back to Velink" : "Create your Velink account"}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {mode === "signin"
                ? "Sign in to manage your workspaces and links."
                : "Get started with edge-accelerated short links."}
            </p>
          </div>

          {/* Social Auth (GitHub) */}
          <button
            onClick={handleGithubLogin}
            disabled={isPending}
            className="flex items-center justify-center gap-3 w-full bg-white text-black h-11 rounded-xl font-semibold text-xs transition-all hover:bg-zinc-200 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GithubIcon className="w-4 h-4" />
            )}
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === "signup" && (
              <div className="space-y-1">
                <div className="flex items-center bg-white/5 border border-white/10 focus-within:border-white/20 focus-within:bg-white/10 transition-colors rounded-xl px-3 h-10">
                  <User className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center bg-white/5 border border-white/10 focus-within:border-white/20 focus-within:bg-white/10 transition-colors rounded-xl px-3 h-10">
                <Mail className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center bg-white/5 border border-white/10 focus-within:border-white/20 focus-within:bg-white/10 transition-colors rounded-xl px-3 h-10">
                <Lock className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 8 characters)"
                  minLength={8}
                  className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : mode === "signin" ? (
                "Sign In with Email"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs text-zinc-500">
            {mode === "signin" ? (
              <span>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="text-white font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className="text-white font-semibold hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-zinc-600">
          By continuing, you agree to Velink&apos;s Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}