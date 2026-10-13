// src/app/(dashboard)/dashboard/analytics/page.tsx
"use client";

import { useEffect, useState, useId } from "react";
import { useSearchParams } from "next/navigation";
import {
  getWorkspaceAnalytics,
  AnalyticsResponse,
} from "@/features/analytics/actions";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MousePointerClick,
  Users,
  Globe,
  Smartphone,
  Laptop,
  Loader2,
  Download,
  Share2,
  Monitor,
  Filter,
} from "lucide-react";

interface TooltipPayloadItem {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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
  const searchParams = useSearchParams();
  const initialLinkId = searchParams.get("linkId") || "all";

  const [selectedLinkId, setSelectedLinkId] = useState<string>(initialLinkId);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("7d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const gradientId = useId();

  useEffect(() => {
    let ignore = false;
    getWorkspaceAnalytics(selectedLinkId, timeRange).then((result) => {
      if (!ignore && result.success && result.data) {
        setData(result.data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [selectedLinkId, timeRange]);

  const handleSelectLink = (linkId: string) => {
    setLoading(true);
    setSelectedLinkId(linkId);
  };

  const handleSelectTimeRange = (range: "24h" | "7d" | "30d" | "all") => {
    setLoading(true);
    setTimeRange(range);
  };

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Name,Count,Percentage\n";

    data.deviceData.forEach((d) => {
      csvContent += `Device,"${d.name}",${d.count},${d.percentage}%\n`;
    });
    data.countryData.forEach((c) => {
      csvContent += `Country,"${c.name}",${c.count},${c.percentage}%\n`;
    });
    data.refererData.forEach((r) => {
      csvContent += `Referrer,"${r.name}",${r.count},${r.percentage}%\n`;
    });
    data.osData.forEach((o) => {
      csvContent += `OperatingSystem,"${o.name}",${o.count},${o.percentage}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `velink_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">Live edge telemetry, visitor metrics, and click traffic.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Link Filter Dropdown */}
          {data?.linksList && data.linksList.length > 0 && (
            <div className="flex items-center bg-[#0A0A0A] border border-white/10 rounded-xl px-3 h-10">
              <Filter className="w-3.5 h-3.5 text-zinc-500 mr-2" />
              <select
                value={selectedLinkId}
                onChange={(e) => handleSelectLink(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-zinc-300 cursor-pointer pr-1"
              >
                <option value="all" className="bg-zinc-900 text-white">All Links</option>
                {data.linksList.map((link) => (
                  <option key={link.id} value={link.id} className="bg-zinc-900 text-white">
                    /{link.slug} ({link.clicks} clicks)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Range Pills */}
          <div className="flex items-center gap-1 bg-[#0A0A0A] border border-white/5 rounded-xl p-1">
            {(
              [
                { id: "24h", label: "24h" },
                { id: "7d", label: "7d" },
                { id: "30d", label: "30d" },
                { id: "all", label: "All" },
              ] as const
            ).map((range) => (
              <button
                key={range.id}
                onClick={() => handleSelectTimeRange(range.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  timeRange === range.id
                    ? "bg-white text-black shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={!data || data.totalClicks === 0}
            className="h-10 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors text-xs font-medium flex items-center gap-1.5 disabled:opacity-40"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        </div>
      ) : !data ? (
        <div className="text-red-400 text-sm">Failed to load analytics.</div>
      ) : (
        <>
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 relative overflow-hidden group shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <MousePointerClick className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Live Edge
                </span>
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Clicks</p>
              <p className="text-3xl font-extrabold text-white tracking-tight">{data.totalClicks}</p>
            </div>

            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 relative overflow-hidden group shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Users className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  Estimated
                </span>
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Unique Visitors</p>
              <p className="text-3xl font-extrabold text-white tracking-tight">{data.uniqueVisitors}</p>
            </div>
          </div>

          {/* Main Area Chart */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Clicks Over Time</h2>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Traffic trend for period ({timeRange.toUpperCase()})
                </p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={data.chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#ffffff",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                      opacity: 0.2,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#ffffff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Grid: Locations & Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Countries / Geo */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-500" /> Geographic Distribution
              </h2>
              {data.countryData.length === 0 ? (
                <p className="text-zinc-500 text-xs">No location telemetry recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {data.countryData.map((country, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-300 font-medium flex items-center gap-2">
                          <span>{country.code}</span>
                          <span>{country.name}</span>
                        </span>
                        <span className="text-zinc-400 font-semibold">
                          {country.count} ({country.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-700"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Devices */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-zinc-500" /> Devices
              </h2>
              {data.deviceData.length === 0 ? (
                <p className="text-zinc-500 text-xs">No device telemetry recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.deviceData.map((device, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        {device.name === "Desktop" ? (
                          <Laptop className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-zinc-400" />
                        )}
                        <span className="text-sm text-zinc-300 font-medium">{device.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 text-xs">{device.count} clicks</span>
                        <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded-md">
                          {device.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Grid: Referrers & Operating Systems */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Traffic Referrers */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-zinc-500" /> Top Referrers
              </h2>
              {data.refererData.length === 0 ? (
                <p className="text-zinc-500 text-xs">No referrer data recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.refererData.map((ref, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-sm text-zinc-300 font-medium truncate pr-2">
                        {ref.name}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-zinc-500 text-xs">{ref.count} clicks</span>
                        <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded-md">
                          {ref.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operating Systems */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-zinc-500" /> Operating Systems
              </h2>
              {data.osData.length === 0 ? (
                <p className="text-zinc-500 text-xs">No OS data recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.osData.map((osItem, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-sm text-zinc-300 font-medium truncate pr-2">
                        {osItem.name}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-zinc-500 text-xs">{osItem.count} clicks</span>
                        <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded-md">
                          {osItem.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}