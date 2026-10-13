// src/app/(dashboard)/dashboard/settings/loading.tsx

export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* 1. Header */}
      <div className="border-b border-white/5 pb-8 space-y-2">
        <div className="h-8 w-44 bg-white/10 rounded-lg" />
        <div className="h-4 w-96 max-w-full bg-white/5 rounded-md" />
      </div>

      <div className="space-y-10">
        {/* 2. User Profile Card */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <div className="w-5 h-5 bg-white/10 rounded" />
            <div className="h-4 w-28 bg-white/10 rounded" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 shrink-0" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-white/10 rounded" />
              <div className="h-4 w-52 bg-white/5 rounded" />
              <div className="h-4 w-32 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>

        {/* 3. Workspace Details Card */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <div className="w-5 h-5 bg-white/10 rounded" />
            <div className="h-4 w-36 bg-white/10 rounded" />
          </div>

          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <div className="h-3 w-28 bg-white/5 rounded" />
              <div className="h-11 w-full bg-white/5 border border-white/10 rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/5 rounded" />
              <div className="h-11 w-full bg-white/[0.02] border border-white/5 rounded-xl" />
              <div className="h-2.5 w-60 bg-white/5 rounded" />
            </div>

            <div className="h-10 w-32 bg-white/10 rounded-xl pt-2" />
          </div>
        </div>

        {/* 4. Workspace Members Card */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-white/10 rounded" />
              <div className="h-4 w-40 bg-white/10 rounded" />
            </div>
            <div className="h-3.5 w-20 bg-white/5 rounded" />
          </div>

          {/* Invite Form Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 h-11 bg-white/5 border border-white/10 rounded-xl" />
            <div className="h-11 w-28 bg-white/5 border border-white/10 rounded-xl" />
            <div className="h-11 w-24 bg-white/10 rounded-xl" />
          </div>

          {/* Members List Skeleton */}
          <div className="divide-y divide-white/5 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-white/10 rounded" />
                    <div className="h-3 w-40 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-20 bg-white/5 rounded-full" />
                  <div className="w-8 h-8 rounded-lg bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Danger Zone Card */}
        <div className="bg-red-500/[0.02] border border-red-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-red-500/20 rounded" />
            <div className="h-4 w-28 bg-red-400/20 rounded" />
          </div>
          <div className="h-3.5 w-full max-w-lg bg-white/5 rounded" />
          <div className="h-10 w-36 bg-red-500/10 border border-red-500/20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
