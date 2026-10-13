// src/app/(dashboard)/dashboard/analytics/loading.tsx

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 pb-16 w-full animate-pulse">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1.5">
          <div className="h-7 w-32 bg-white/10 rounded-lg" />
          <div className="h-3.5 w-72 bg-white/5 rounded-md" />
        </div>

        {/* Action Controls Skeleton */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Link Filter Pill */}
          <div className="h-8.5 w-32 bg-zinc-950/80 border border-white/10 rounded-lg" />
          {/* Time Range Pills */}
          <div className="h-8.5 w-44 bg-zinc-950/80 border border-white/10 rounded-lg" />
          {/* Refresh Action */}
          <div className="h-8.5 w-8.5 bg-zinc-950/80 border border-white/10 rounded-lg" />
          {/* Export Actions */}
          <div className="h-8.5 w-28 bg-zinc-950/80 border border-white/10 rounded-lg" />
        </div>
      </div>

      {/* 2. Unified KPI Metric Strip (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-white/[0.08] bg-zinc-950/40 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] overflow-hidden shadow-sm">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 space-y-2">
            <div className="h-3 w-20 bg-white/5 rounded" />
            <div className="h-8 w-24 bg-white/10 rounded-md" />
            <div className="h-3 w-28 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Main Chart Card */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="h-4 w-36 bg-white/10 rounded" />
            <div className="h-3 w-48 bg-white/5 rounded" />
          </div>
          {/* View Toggle */}
          <div className="h-7 w-48 bg-black/60 border border-white/10 rounded-lg" />
        </div>

        {/* Chart Canvas Area */}
        <div className="h-[260px] w-full pt-4 flex flex-col justify-end gap-3 border-b border-white/[0.04] pb-2">
          <div className="flex items-end justify-between gap-2 h-44 px-4">
            {[40, 65, 30, 85, 55, 95, 70, 45, 80, 60, 90, 75].map((height, idx) => (
              <div
                key={idx}
                className="flex-1 bg-white/[0.04] rounded-t-sm"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between px-2 pt-2 border-t border-white/5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-2.5 w-10 bg-white/5 rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Balanced 2-Column Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Column 1: Links Performance */}
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/40 p-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="space-y-1">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-2.5 w-36 bg-white/5 rounded" />
            </div>
            <div className="h-3 w-12 bg-white/5 rounded" />
          </div>

          <div className="space-y-2 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-white/[0.02] border border-white/5 p-2.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-16 bg-white/10 rounded font-mono" />
                  <div className="h-2.5 w-28 bg-white/5 rounded" />
                </div>
                <div className="h-3 w-12 bg-white/10 rounded font-mono" />
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Audience Breakdown */}
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/40 p-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="space-y-1">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-2.5 w-44 bg-white/5 rounded" />
            </div>
            <div className="h-6 w-40 bg-black/60 border border-white/10 rounded-lg" />
          </div>

          <div className="space-y-2 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-white/[0.02] border border-white/5 p-2.5 flex items-center justify-between"
              >
                <div className="h-3 w-28 bg-white/10 rounded font-mono" />
                <div className="h-3 w-14 bg-white/10 rounded font-mono" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
