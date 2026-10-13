// src/app/(dashboard)/dashboard/domains/loading.tsx

export default function DomainsLoading() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white/10 rounded-lg" />
            <div className="h-8 w-56 bg-white/10 rounded-lg" />
          </div>
          <div className="h-4 w-96 max-w-full bg-white/5 rounded-md" />
        </div>
      </div>

      {/* 2. Add Domain Form Card */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="h-4 w-48 bg-white/10 rounded" />
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl" />
          <div className="h-12 w-32 bg-white/15 rounded-xl shrink-0" />
        </div>
      </div>

      {/* 3. DNS Configuration Instructions Card */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-blue-500/20" />
          <div className="h-4 w-60 bg-white/10 rounded" />
        </div>
        <div className="h-3.5 w-full max-w-xl bg-white/5 rounded" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2"
            >
              <div className="h-2.5 w-20 bg-white/5 rounded" />
              <div className="h-4 w-28 bg-white/10 rounded font-mono" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Registered Workspace Domains List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="h-4 w-52 bg-white/10 rounded" />
          <div className="h-3.5 w-16 bg-white/5 rounded" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-40 bg-white/10 rounded font-mono" />
                  <div className="h-5 w-24 bg-white/5 rounded-full" />
                </div>
                <div className="h-3 w-56 bg-white/5 rounded" />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-9 w-24 bg-white/10 rounded-xl" />
                <div className="h-9 w-9 bg-white/5 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
