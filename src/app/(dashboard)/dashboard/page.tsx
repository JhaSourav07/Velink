// src/app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-16 selection:bg-white/30">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight">Workspace Overview</h1>
        <p className="text-zinc-400 mt-2">
          Welcome to Velink. You are officially authenticated.
        </p>
      </div>
    </div>
  );
}