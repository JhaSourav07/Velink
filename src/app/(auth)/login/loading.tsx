// src/app/(auth)/login/loading.tsx

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black selection:bg-white/30 text-white relative overflow-hidden p-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-pulse">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl mb-2" />
            <div className="h-5 w-48 bg-white/10 rounded" />
            <div className="h-3.5 w-60 bg-white/5 rounded" />
          </div>

          {/* Social Auth Skeleton */}
          <div className="w-full h-11 rounded-xl bg-white/10" />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-white/10 flex-1" />
            <div className="h-2.5 w-4 bg-white/10 rounded" />
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Form inputs */}
          <div className="space-y-3.5">
            <div className="h-10 w-full bg-white/5 border border-white/10 rounded-xl" />
            <div className="h-10 w-full bg-white/5 border border-white/10 rounded-xl" />
            <div className="h-10 w-full bg-white/10 rounded-xl" />
          </div>

          {/* Mode Switcher */}
          <div className="pt-2 flex justify-center">
            <div className="h-3.5 w-44 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
