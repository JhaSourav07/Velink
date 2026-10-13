// src/app/(dashboard)/dashboard/loading.tsx

export default function DashboardLoading() {
  return (
    <div className="space-y-10 animate-pulse w-full">
      {/* 1. Welcoming & Status Context Header */}
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
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5" />
              <div className="h-3 w-14 bg-white/5 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/5 rounded" />
              <div className="h-8 w-20 bg-white/10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Create Short Link Card */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="h-4 w-44 bg-white/10 rounded" />
        <div className="space-y-4 pt-1">
          <div className="h-12 w-full bg-white/[0.03] border border-white/10 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-12 w-full bg-white/[0.03] border border-white/10 rounded-xl" />
            <div className="h-12 w-full bg-white/[0.03] border border-white/10 rounded-xl" />
          </div>
          <div className="h-11 w-36 bg-white/15 rounded-xl" />
        </div>
      </div>

      {/* 4. Live Link Registry Overview */}
      <div className="pt-6 border-t border-white/5 space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1.5">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-3 w-72 bg-white/5 rounded" />
          </div>
          <div className="h-6 w-24 bg-white/5 rounded-full" />
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="h-10 w-full sm:w-80 bg-[#0A0A0A] border border-white/10 rounded-xl" />
          <div className="h-10 w-full sm:w-64 bg-[#0A0A0A] border border-white/5 rounded-xl" />
        </div>

        {/* Link Items Skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-[#0A0A0A] border-white/5 gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 w-36 bg-white/10 rounded font-mono" />
                <div className="h-3 w-64 max-w-full bg-white/5 rounded" />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-8 w-16 bg-white/5 rounded-lg" />
                <div className="h-8 w-8 bg-white/5 rounded-lg" />
                <div className="h-8 w-8 bg-white/10 rounded-lg" />
                <div className="h-8 w-8 bg-white/5 rounded-lg" />
                <div className="h-8 w-8 bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
