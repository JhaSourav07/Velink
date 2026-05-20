// src/app/(dashboard)/dashboard/page.tsx
import { CreateLinkForm } from "@/features/links/components/create-link-form";

export default function DashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Create a new link
        </h1>
        <p className="text-zinc-400 text-sm">
          Paste your long URL below to create a trackable, short velink.
        </p>
      </div>

      {/* Action Area */}
      <div className="max-w-3xl">
        <CreateLinkForm />
      </div>

      {/* Future Links Table Placeholder */}
      <div className="pt-8 border-t border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">Your Links</h2>
        <div className="h-64 border border-white/5 border-dashed rounded-xl flex items-center justify-center text-zinc-600 text-sm bg-white/[0.02]">
          Your shortened links will appear here.
        </div>
      </div>

    </div>
  );
}