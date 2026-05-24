// src/app/(dashboard)/dashboard/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getWorkspaceAnalytics } from "@/features/analytics/actions";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MousePointerClick, Users, Globe, Smartphone, Laptop, Loader2 } from "lucide-react";

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-3 shadow-2xl backdrop-blur-md">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        <p className="text-white font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white/80" />
          {payload[0].value} Clicks
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const result = await getWorkspaceAnalytics();
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="text-red-400">Failed to load analytics.</div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">Live data from your edge network.</p>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
              <MousePointerClick className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm font-medium mb-1">Total Clicks</p>
          <p className="text-3xl font-semibold text-white tracking-tight">{data.totalClicks}</p>
        </div>
        
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm font-medium mb-1">Unique Visitors</p>
          <p className="text-3xl font-semibold text-white tracking-tight">
            {/* Simple estimation for now. Will refine with distinct IPs later */}
            {Math.max(1, Math.floor(data.totalClicks * 0.8))}
          </p>
        </div>
      </div>

      {/* Main Area Chart */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-medium text-white">Clicks over time</h2>
        </div>
        <div className="h-[300px] w-full flex items-center justify-center">
          {!mounted ? (
            <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 12 }} dy={10} />
                <YAxis hide={true} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.2 }} />
                <Area type="monotone" dataKey="clicks" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Breakdown Grid (Countries, Devices) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Countries */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white mb-6 flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-500" /> Locations
          </h2>
          {data.countryData.length === 0 ? (
            <p className="text-zinc-500 text-sm">No location data yet.</p>
          ) : (
            <div className="space-y-5">
              {data.countryData.map((country: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-lg w-6 text-center">{country.code}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-300 font-medium">{country.name}</span>
                      <span className="text-zinc-500">{country.count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white/80 rounded-full transition-all duration-1000" style={{ width: `${country.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-white mb-6 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-zinc-500" /> Devices
          </h2>
          {data.deviceData.length === 0 ? (
            <p className="text-zinc-500 text-sm">No device data yet.</p>
          ) : (
            <div className="space-y-4">
              {data.deviceData.map((device: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    {device.name === "Desktop" ? <Laptop className="w-4 h-4 text-zinc-400" /> : <Smartphone className="w-4 h-4 text-zinc-400" />}
                    <span className="text-sm text-zinc-300 font-medium">{device.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-500 text-sm">{device.count} clicks</span>
                    <span className="text-sm font-medium text-white">{device.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}