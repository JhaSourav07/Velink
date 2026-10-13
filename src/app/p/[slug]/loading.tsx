// src/app/p/[slug]/loading.tsx

export default function PasswordLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-white/30 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-pulse">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl mb-6" />

          <div className="h-5 w-36 bg-white/10 rounded mb-2" />
          <div className="h-3.5 w-64 bg-white/5 rounded mb-8" />

          <div className="w-full flex flex-col gap-3">
            <div className="w-full h-11 bg-white/5 border border-white/10 rounded-lg" />
            <div className="w-full h-11 bg-white/15 rounded-lg" />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="h-3 w-32 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}
