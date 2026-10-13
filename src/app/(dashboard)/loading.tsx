// src/app/(dashboard)/loading.tsx

export default function DashboardLayoutLoading() {
  return (
    <div className="space-y-10 animate-pulse w-full">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-white/10 rounded-lg" />
          <div className="h-4 w-44 bg-white/5 rounded-md" />
        </div>
        <div className="h-9 w-36 bg-white/5 border border-white/5 rounded-xl" />
      </div>

      {/* 2. Metrics Cards Grid (3 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/5" />
              <div className="h-3.5 w-16 bg-white/5 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-7 w-24 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Action Container */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-44 bg-white/10 rounded" />
          <div className="h-3.5 w-72 bg-white/5 rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-14 w-full bg-white/[0.03] border border-white/5 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-14 w-full bg-white/[0.03] border border-white/5 rounded-xl" />
            <div className="h-14 w-full bg-white/[0.03] border border-white/5 rounded-xl" />
          </div>
          <div className="h-11 w-36 bg-white/15 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
