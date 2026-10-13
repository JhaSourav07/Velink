// src/app/loading.tsx

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between p-6 animate-pulse">
      {/* Top Navigation Bar Skeleton */}
      <div className="w-full max-w-6xl h-16 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10" />
          <div className="h-5 w-24 bg-white/10 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-20 bg-white/5 rounded-lg" />
          <div className="h-9 w-24 bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-6 my-auto py-20">
        <div className="h-7 w-48 bg-white/5 border border-white/10 rounded-full" />
        <div className="space-y-3 w-full flex flex-col items-center">
          <div className="h-12 sm:h-14 w-4/5 max-w-xl bg-white/10 rounded-xl" />
          <div className="h-12 sm:h-14 w-3/5 max-w-md bg-white/10 rounded-xl" />
        </div>
        <div className="h-4 w-96 max-w-full bg-white/5 rounded-md" />
        <div className="flex items-center gap-4 pt-4">
          <div className="h-11 w-36 bg-white/15 rounded-xl" />
          <div className="h-11 w-32 bg-white/5 border border-white/10 rounded-xl" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="w-full max-w-6xl h-12 border-t border-white/5 flex items-center justify-between">
        <div className="h-3 w-32 bg-white/5 rounded" />
        <div className="h-3 w-40 bg-white/5 rounded" />
      </div>
    </div>
  );
}
