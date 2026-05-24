// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { InteractiveSimulator } from "@/components/interactive-simulator";
import { 
  Link2, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  MousePointerClick, 
  Globe, 
  Shield, 
  Zap, 
  BarChart3, 
  ArrowUpRight, 
  Check 
} from "lucide-react";

export default async function Home() {
  // 1. Get current session to dynamically render CTAs
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30 font-sans relative overflow-x-hidden">
      
      {/* Premium Background Glow Layer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[30%] h-[60%] bg-zinc-500/[0.03] blur-[140px] rounded-full" />
        <div className="absolute top-[-5%] right-[20%] w-[40%] h-[70%] bg-white/[0.02] blur-[150px] rounded-full" />
      </div>

      {/* 1. Navbar */}
      <header className="fixed top-5 inset-x-0 max-w-5xl mx-auto px-4 z-50">
        <nav className="flex items-center justify-between bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3.5 shadow-2xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
              Velink
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-zinc-500">
                  Welcome, <span className="text-zinc-300 font-medium">{session.user.name?.split(" ")[0]}</span>
                </span>
                <Link
                  href="/dashboard"
                  className="h-9 px-4 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs flex items-center hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="h-9 px-4 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-1 hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Dynamic Anycast Edge Redirection Badge */}
        <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span className="text-[10px] sm:text-xs font-semibold tracking-wide uppercase text-zinc-300">
            ⚡ Dynamic Anycast Edge Redirection
          </span>
        </div>

        {/* High-Impact Typography */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.1] bg-gradient-to-b from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent mb-6">
          Shorten. Track. Scale.<br className="hidden sm:inline" />
          The Modern Link Infrastructure.
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
          A high-performance link management platform built for modern teams. 
          Dynamic global redirects, real-time edge analytics, and premium custom domains.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="h-12 px-6 rounded-xl bg-white text-black font-semibold text-sm flex items-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-xl"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="h-12 px-6 rounded-xl bg-white text-black font-semibold text-sm flex items-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-xl"
            >
              Start Shortening Free <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noreferrer"
            className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            Read API Docs
          </a>
        </div>

        {/* Interactive Link Simulator Widget */}
        <InteractiveSimulator />

      </section>

      {/* 3. Edge Analytics Mock Section */}
      <section id="analytics" className="relative z-10 py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-zinc-400" />
            Edge Analytics in Real-Time
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Gain immediate visibility into your global traffic distribution. Track clicks, referrers, locations, and device types instantly.
          </p>
        </div>

        {/* High-Fidelity Interactive CSS Dashboard Mock */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-500/[0.01] blur-[80px] rounded-full pointer-events-none" />
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Live Redirection Stream</p>
                <p className="text-white text-sm font-semibold mt-0.5">velink.dev/github-repo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +14.2% increase today
              </span>
            </div>
          </div>

          {/* Grid metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1">
              <p className="text-zinc-500 text-xs font-medium">Total Clicks</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white tracking-tight">12,492</p>
                <span className="text-emerald-500 text-[10px] font-bold">+89 today</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1">
              <p className="text-zinc-500 text-xs font-medium">Average Latency</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white tracking-tight">32ms</p>
                <span className="text-zinc-500 text-[10px]">Global Edge Average</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-1">
              <p className="text-zinc-500 text-xs font-medium">Anycast Node Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-sm font-semibold text-white">42 Nodes Healthy</p>
              </div>
            </div>
          </div>

          {/* Breakdown lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Device and Referrer Breakdown */}
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Device Distribution</h4>
              
              <div className="space-y-3">
                {/* Desktop */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">Desktop</span>
                    <span className="font-semibold text-white">64%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: "64%" }} />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">Mobile</span>
                    <span className="font-semibold text-white">31%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-500 rounded-full" style={{ width: "31%" }} />
                  </div>
                </div>

                {/* Tablet */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">Tablet / Other</span>
                    <span className="font-semibold text-white">5%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-700 rounded-full" style={{ width: "5%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Geo & Referrer Distribution */}
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Top Traffic Referrers</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-500" /> twitter.com
                  </span>
                  <span className="font-semibold text-white">4,812 clicks (38.5%)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-500" /> github.com
                  </span>
                  <span className="font-semibold text-white">3,205 clicks (25.6%)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-500" /> producthunt.com
                  </span>
                  <span className="font-semibold text-white">1,995 clicks (15.9%)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-500" /> Direct / Email
                  </span>
                  <span className="font-semibold text-white">2,480 clicks (20.0%)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Features Grid Section */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Built for High-Performance Redirects
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Every layer of Velink is engineered with sub-millisecond execution patterns, keeping your user experience frictionless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] rounded-2xl p-6 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:border-white/20 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight mb-2">
              Anycast Routing Redirections
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Global routing connects incoming requests to the closest edge server, resolving redirection paths in under 50 milliseconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] rounded-2xl p-6 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:border-white/20 transition-colors">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight mb-2">
              Branded Custom Domains
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Bring your own custom domain or use our default premium extensions to maximize click-through rates and build brand trust.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] rounded-2xl p-6 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:border-white/20 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight mb-2">
              Advanced Link Protections
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Secure sensitive content with passcode authorizations, custom link expiry schedules, and programmatic temporary archivals.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Pricing Grid Section */}
      <section id="pricing" className="relative z-10 py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Simple, Scaleable Pricing
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Start completely free of charge and seamlessly scale your link infrastructure as your organization grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Free Tier */}
          <div className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative group">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-zinc-500 mb-2">Free Plan</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-white">$0</span>
                <span className="text-zinc-500 text-xs">/ month</span>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                Perfect for personal link shorteners and small developer projects.
              </p>
              <ul className="space-y-3.5 mb-8 text-xs text-zinc-300 border-t border-white/5 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Up to 50 shortened links
                </li>
                <li className="flex items-center gap-2 text-zinc-500 line-through">
                  <Check className="w-3.5 h-3.5 shrink-0" /> Branded custom domains
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Basic link redirections
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> 7-day analytics window
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="h-10 w-full rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center transition-colors border border-white/10"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="bg-zinc-950 border border-white/20 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative shadow-2xl">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-white text-black text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full border border-white">
              Most Popular
            </div>
            
            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-zinc-300 mb-2">Pro Plan</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-white">$19</span>
                <span className="text-zinc-500 text-xs">/ month</span>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                Engineered for scaling creators, marketing campaigns, and fast-growing startups.
              </p>
              <ul className="space-y-3.5 mb-8 text-xs text-zinc-300 border-t border-white/10 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" /> Unlimited shortened links
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" /> Up to 3 Branded custom domains
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" /> Advanced link passcode & expires
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-white shrink-0" /> 1-year analytics window
                </li>
              </ul>
            </div>
            
            <Link
              href="/login"
              className="h-10 w-full rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center hover:bg-zinc-200 transition-colors shadow-lg"
            >
              Upgrade to Pro
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative group">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-zinc-500 mb-2">Enterprise Plan</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-white">Custom</span>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                Designed for enterprise-grade volumes, deep custom branding, and custom SLA agreements.
              </p>
              <ul className="space-y-3.5 mb-8 text-xs text-zinc-300 border-t border-white/5 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Unlimited everything
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Custom branding & SLA
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Full analytics API access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Dedicated 24/7 slack support
                </li>
              </ul>
            </div>
            <Link
              href="mailto:support@velink.dev"
              className="h-10 w-full rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center transition-colors border border-white/10"
            >
              Contact Sales
            </Link>
          </div>

        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="border-t border-white/5 bg-black z-10 relative">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-zinc-500 text-xs">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-white" />
            <span className="font-semibold text-white tracking-tight">Velink</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Built on Next.js
            </a>
            <a href="https://prisma.io" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Prisma
            </a>
            <a href="https://better-auth.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Better Auth
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
