// src/app/(dashboard)/dashboard/analytics/page.tsx
"use client";

import { useEffect, useState, useId } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  CartesianGrid,
} from "recharts";
import {
  Download,
  Filter,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  FileText,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/95 border border-white/10 rounded-lg px-3 py-2.5 shadow-2xl text-xs space-y-1.5 min-w-[140px] backdrop-blur-md">
        <p className="text-zinc-500 font-mono text-[11px]">{label}</p>
        <div className="space-y-1 pt-1 border-t border-white/5">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 font-mono text-xs">
              <span className="text-zinc-400 capitalize">
                {item.dataKey === "clicks" ? "Clicks" : "Visitors"}
              </span>
              <span className="text-white font-medium">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialLinkId = searchParams.get("linkId") || "all";
  const initialRange = (searchParams.get("range") as "24h" | "7d" | "30d" | "all") || "all";

  const [selectedLinkId, setSelectedLinkId] = useState<string>(initialLinkId);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">(initialRange);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartView, setChartView] = useState<"clicks" | "visitors" | "both">("clicks");
  const [breakdownTab, setBreakdownTab] = useState<"referrers" | "countries" | "devices" | "os">("referrers");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const clicksGradientId = useId();
  const visitorsGradientId = useId();

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
    const params = new URLSearchParams(window.location.search);
    if (linkId === "all") {
      params.delete("linkId");
    } else {
      params.set("linkId", linkId);
    }
    router.replace(`?${params.toString()}`);
  };

  const handleSelectTimeRange = (range: "24h" | "7d" | "30d" | "all") => {
    setLoading(true);
    setTimeRange(range);
    const params = new URLSearchParams(window.location.search);
    if (range === "all") {
      params.delete("range");
    } else {
      params.set("range", range);
    }
    router.replace(`?${params.toString()}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await getWorkspaceAnalytics(selectedLinkId, timeRange);
      if (result.success && result.data) {
        setData(result.data);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
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
    data.cityData.forEach((ci) => {
      csvContent += `City,"${ci.name}",${ci.count},${ci.percentage}%\n`;
    });
    data.refererData.forEach((r) => {
      csvContent += `Referrer,"${r.name}",${r.count},${r.percentage}%\n`;
    });
    data.osData.forEach((o) => {
      csvContent += `OperatingSystem,"${o.name}",${o.count},${o.percentage}%\n`;
    });
    data.browserData.forEach((b) => {
      csvContent += `Browser,"${b.name}",${b.count},${b.percentage}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `velink_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `velink_analytics_${timeRange}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedLinkObj = data?.linksList.find((l) => l.id === selectedLinkId);

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Analytics</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Performance and visitor telemetry across your workspace links.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Link Filter Select */}
          <div className="relative flex items-center bg-zinc-950/80 border border-white/10 hover:border-white/20 rounded-lg px-2.5 h-8.5 transition-colors">
            <Filter className="w-3 h-3 text-zinc-500 mr-2 shrink-0" />
            <select
              value={selectedLinkId}
              onChange={(e) => handleSelectLink(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-zinc-300 cursor-pointer pr-4 appearance-none font-medium"
              aria-label="Filter analytics by link"
            >
              <option value="all" className="bg-zinc-950 text-white">
                All Links ({data?.linksList?.length || 0})
              </option>
              {data?.linksList?.map((link) => (
                <option key={link.id} value={link.id} className="bg-zinc-950 text-white">
                  /{link.slug} ({link.clicks})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 pointer-events-none absolute right-2" />
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center bg-zinc-950/80 border border-white/10 rounded-lg p-0.5">
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
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  timeRange === range.id
                    ? "bg-white/15 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            aria-label="Refresh telemetry"
            className="h-8.5 w-8.5 flex items-center justify-center rounded-lg border border-white/10 hover:border-white/20 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-white" : ""}`} />
          </button>

          {/* Export Actions */}
          <div className="flex items-center border border-white/10 rounded-lg bg-zinc-950/80 overflow-hidden divide-x divide-white/[0.08] h-8.5">
            <button
              onClick={handleExportCSV}
              disabled={!data || data.totalClicks === 0}
              className="px-2.5 h-full hover:bg-zinc-900 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-40"
              title="Export CSV"
            >
              <Download className="w-3 h-3 text-zinc-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              disabled={!data || data.totalClicks === 0}
              className="px-2.5 h-full hover:bg-zinc-900 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-40"
              title="Export JSON"
            >
              <FileText className="w-3 h-3 text-zinc-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Active Pill */}
      {selectedLinkId !== "all" && selectedLinkObj && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-zinc-950/70 border border-white/[0.08] text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-zinc-400">Filtering link:</span>
            <span className="text-white font-mono font-medium">
              {selectedLinkObj.domain}/{selectedLinkObj.slug}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-500 truncate max-w-sm">{selectedLinkObj.url}</span>
          </div>
          <button
            onClick={() => handleSelectLink("all")}
            className="text-xs text-zinc-400 hover:text-white underline underline-offset-2 ml-4 shrink-0"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Helpful Historical Data Notice */}
      {!loading && data && data.totalClicks === 0 && data.allTimeTotalClicks > 0 && timeRange !== "all" && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-950/60 border border-white/[0.08] text-xs">
          <span className="text-zinc-400">
            No clicks recorded in the last <strong>{timeRange}</strong>. You have{" "}
            <strong className="text-white">{data.allTimeTotalClicks} clicks</strong> recorded in All Time.
          </span>
          <button
            onClick={() => handleSelectTimeRange("all")}
            className="text-xs font-medium text-white hover:underline flex items-center gap-1 ml-4 shrink-0"
          >
            <span>View All Time</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-white/[0.08] bg-zinc-950/40 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 space-y-2">
                <div className="h-3 w-16 bg-white/5 rounded" />
                <div className="h-7 w-20 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/5 rounded" />
              </div>
            ))}
          </div>
          <div className="h-72 rounded-xl border border-white/[0.08] bg-zinc-950/40" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 rounded-xl border border-white/[0.08] bg-zinc-950/40" />
            <div className="h-64 rounded-xl border border-white/[0.08] bg-zinc-950/40" />
          </div>
        </div>
      ) : !data ? (
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/40 p-8 text-center text-xs text-zinc-400">
          Failed to load analytics telemetry.
        </div>
      ) : (
        <>
          {/* 2. Unified KPI Metric Strip (Vercel Style) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-white/[0.08] bg-zinc-950/40 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] overflow-hidden shadow-sm">
            {/* Total Clicks */}
            <div className="p-5 space-y-1">
              <p className="text-xs font-medium text-zinc-400">Total Clicks</p>
              <p className="text-2xl font-bold tracking-tight text-white font-mono">
                {data.totalClicks.toLocaleString()}
              </p>
              <p className="text-[11px] text-zinc-500 pt-0.5">
                {data.percentageChange !== 0 ? (
                  <span className={data.percentageChange > 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                    {data.percentageChange > 0 ? `+${data.percentageChange}%` : `${data.percentageChange}%`}
                  </span>
                ) : (
                  <span>0%</span>
                )}{" "}
                vs. previous period
              </p>
            </div>

            {/* Visitors */}
            <div className="p-5 space-y-1">
              <p className="text-xs font-medium text-zinc-400">Visitors</p>
              <p className="text-2xl font-bold tracking-tight text-white font-mono">
                {data.uniqueVisitors.toLocaleString()}
              </p>
              <p className="text-[11px] text-zinc-500 pt-0.5">
                {data.totalClicks > 0
                  ? `${Math.round((data.uniqueVisitors / data.totalClicks) * 100)}% of total clicks`
                  : "0% of total clicks"}
              </p>
            </div>

            {/* Avg. Daily Clicks */}
            <div className="p-5 space-y-1">
              <p className="text-xs font-medium text-zinc-400">Avg. Daily Clicks</p>
              <p className="text-2xl font-bold tracking-tight text-white font-mono">
                {data.avgClicksPerDay}
              </p>
              <p className="text-[11px] text-zinc-500 pt-0.5 truncate">
                {data.peakDay && data.peakDay.clicks > 0 ? (
                  <>
                    Peak: <span className="text-zinc-300 font-mono">{data.peakDay.clicks}</span> ({data.peakDay.date})
                  </>
                ) : (
                  "No activity peak"
                )}
              </p>
            </div>

            {/* Top Country */}
            <div className="p-5 space-y-1">
              <p className="text-xs font-medium text-zinc-400">Top Location</p>
              <p className="text-2xl font-bold tracking-tight text-white truncate flex items-center gap-2">
                {data.countryData.length > 0 && data.countryData[0].name !== "Direct / Local" ? (
                  <>
                    <span>{data.countryData[0].flag}</span>
                    <span className="truncate text-lg">{data.countryData[0].name}</span>
                  </>
                ) : data.countryData.length > 0 ? (
                  <span className="truncate text-lg">{data.countryData[0].name}</span>
                ) : (
                  <span className="text-zinc-600 font-mono">—</span>
                )}
              </p>
              <p className="text-[11px] text-zinc-500 pt-0.5">
                {data.countryData.length > 0 ? `${data.countryData[0].percentage}% of total traffic` : "Awaiting visits"}
              </p>
            </div>
          </div>

          {/* 3. Main Chart Card */}
          <div className="rounded-xl border border-white/[0.08] bg-zinc-950/40 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Clicks Over Time</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {timeRange === "all" ? "All recorded link activity" : `Activity in the last ${timeRange}`}
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setChartView("clicks")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    chartView === "clicks"
                      ? "bg-white/15 text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Clicks
                </button>
                <button
                  onClick={() => setChartView("visitors")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    chartView === "visitors"
                      ? "bg-white/15 text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Visitors
                </button>
                <button
                  onClick={() => setChartView("both")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    chartView === "both"
                      ? "bg-white/15 text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Compare
                </button>
              </div>
            </div>

            {/* Chart Canvas */}
            {data.totalClicks === 0 ? (
              <div className="h-[220px] flex flex-col items-center justify-center border border-dashed border-white/[0.08] rounded-lg p-6 text-center space-y-2">
                <p className="text-xs text-zinc-400">No clicks recorded in this time range.</p>
                {data.allTimeTotalClicks > 0 && timeRange !== "all" ? (
                  <button
                    onClick={() => handleSelectTimeRange("all")}
                    className="text-xs text-white font-medium hover:underline flex items-center gap-1"
                  >
                    <span>Switch to All Time ({data.allTimeTotalClicks} clicks)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <p className="text-[11px] text-zinc-500">
                    Share your links to start tracking live visitor telemetry.
                  </p>
                )}
              </div>
            ) : (
              <div className="h-[260px] w-full pt-2">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={data.chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id={clicksGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id={visitorsGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0070f3" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0070f3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#27272a"
                      vertical={false}
                      opacity={0.4}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 11 }}
                      dy={8}
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
                        stroke: "#52525b",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />
                    {(chartView === "clicks" || chartView === "both") && (
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#ffffff"
                        strokeWidth={1.75}
                        fillOpacity={1}
                        fill={`url(#${clicksGradientId})`}
                        activeDot={{ r: 4, fill: "#ffffff", stroke: "#000", strokeWidth: 2 }}
                      />
                    )}
                    {(chartView === "visitors" || chartView === "both") && (
                      <Area
                        type="monotone"
                        dataKey="uniqueVisitors"
                        stroke="#0070f3"
                        strokeWidth={1.75}
                        fillOpacity={1}
                        fill={`url(#${visitorsGradientId})`}
                        activeDot={{ r: 4, fill: "#0070f3", stroke: "#000", strokeWidth: 2 }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 4. Balanced 2-Column Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Column 1: Links Performance */}
            <div className="rounded-xl border border-white/[0.08] bg-zinc-950/40 p-5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-semibold text-white">Links</h3>
                  <p className="text-[11px] text-zinc-500">Workspace links and engagement</p>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {data.topLinks.length} total
                </span>
              </div>

              {data.topLinks.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No links created in this workspace yet.
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {data.topLinks.map((link) => (
                    <div
                      key={link.id}
                      className="relative flex items-center justify-between px-3 py-2.5 rounded-lg overflow-hidden text-xs group hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.05]"
                    >
                      {/* Subtle background proportional fill */}
                      {link.percentage > 0 && (
                        <div
                          className="absolute inset-y-0 left-0 bg-white/[0.06] rounded-lg transition-all duration-300"
                          style={{ width: `${link.percentage}%` }}
                        />
                      )}

                      <div className="relative z-10 flex items-center gap-2 truncate pr-3">
                        <span className="font-mono text-white font-medium">/{link.slug}</span>
                        <span className="text-zinc-500 truncate max-w-[180px]">{link.url}</span>
                      </div>

                      <div className="relative z-10 flex items-center gap-2 text-zinc-400 font-mono shrink-0">
                        {data.totalClicks > 0 ? (
                          <>
                            <span>{link.clicks.toLocaleString()}</span>
                            <span className="text-zinc-500 text-[11px]">({link.percentage}%)</span>
                          </>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">{link.allTimeClicks} clicks</span>
                        )}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <button
                            onClick={() => handleCopy(`https://${link.domain}/${link.slug}`, link.id)}
                            className="p-1 hover:text-white"
                            title="Copy link"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleSelectLink(link.id)}
                            className="p-1 hover:text-white"
                            title="Filter this link"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Audience & Platform Telemetry (Tabbed) */}
            <div className="rounded-xl border border-white/[0.08] bg-zinc-950/40 p-5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-semibold text-white">Audience Breakdown</h3>
                  <p className="text-[11px] text-zinc-500">Traffic sources, geography, and platforms</p>
                </div>
                <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setBreakdownTab("referrers")}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      breakdownTab === "referrers"
                        ? "bg-white/15 text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Sources
                  </button>
                  <button
                    onClick={() => setBreakdownTab("countries")}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      breakdownTab === "countries"
                        ? "bg-white/15 text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Location
                  </button>
                  <button
                    onClick={() => setBreakdownTab("devices")}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      breakdownTab === "devices"
                        ? "bg-white/15 text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Devices
                  </button>
                  <button
                    onClick={() => setBreakdownTab("os")}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      breakdownTab === "os"
                        ? "bg-white/15 text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    OS
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="pt-1">
                {breakdownTab === "referrers" && (
                  data.refererData.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      No referrer telemetry recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {data.refererData.map((ref, idx) => (
                        <div
                          key={idx}
                          className="relative flex items-center justify-between px-3 py-2.5 rounded-lg overflow-hidden text-xs group hover:bg-white/[0.03] transition-colors"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-white/[0.06] rounded-lg transition-all duration-300"
                            style={{ width: `${ref.percentage}%` }}
                          />
                          <span className="relative z-10 font-mono text-zinc-200 truncate">
                            {ref.name}
                          </span>
                          <div className="relative z-10 flex items-center gap-2 text-zinc-400 font-mono shrink-0">
                            <span>{ref.count.toLocaleString()}</span>
                            <span className="text-zinc-500 text-[11px]">({ref.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {breakdownTab === "countries" && (
                  data.countryData.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      No geographic telemetry recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {data.countryData.map((country, idx) => (
                        <div
                          key={idx}
                          className="relative flex items-center justify-between px-3 py-2.5 rounded-lg overflow-hidden text-xs group hover:bg-white/[0.03] transition-colors"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-white/[0.06] rounded-lg transition-all duration-300"
                            style={{ width: `${country.percentage}%` }}
                          />
                          <div className="relative z-10 flex items-center gap-2 truncate">
                            {country.flag !== "🌐" && <span>{country.flag}</span>}
                            <span className="text-zinc-200 font-medium truncate">{country.name}</span>
                          </div>
                          <div className="relative z-10 flex items-center gap-2 text-zinc-400 font-mono shrink-0">
                            <span>{country.count.toLocaleString()}</span>
                            <span className="text-zinc-500 text-[11px]">({country.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {breakdownTab === "devices" && (
                  data.deviceData.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      No device telemetry recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {data.deviceData.map((device, idx) => (
                        <div
                          key={idx}
                          className="relative flex items-center justify-between px-3 py-2.5 rounded-lg overflow-hidden text-xs group hover:bg-white/[0.03] transition-colors"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-white/[0.06] rounded-lg transition-all duration-300"
                            style={{ width: `${device.percentage}%` }}
                          />
                          <span className="relative z-10 text-zinc-200 font-medium">
                            {device.name}
                          </span>
                          <div className="relative z-10 flex items-center gap-2 text-zinc-400 font-mono shrink-0">
                            <span>{device.count.toLocaleString()}</span>
                            <span className="text-zinc-500 text-[11px]">({device.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {breakdownTab === "os" && (
                  data.osData.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      No operating system telemetry recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {data.osData.map((osItem, idx) => (
                        <div
                          key={idx}
                          className="relative flex items-center justify-between px-3 py-2.5 rounded-lg overflow-hidden text-xs group hover:bg-white/[0.03] transition-colors"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-white/[0.06] rounded-lg transition-all duration-300"
                            style={{ width: `${osItem.percentage}%` }}
                          />
                          <span className="relative z-10 text-zinc-200 font-medium">
                            {osItem.name}
                          </span>
                          <div className="relative z-10 flex items-center gap-2 text-zinc-400 font-mono shrink-0">
                            <span>{osItem.count.toLocaleString()}</span>
                            <span className="text-zinc-500 text-[11px]">({osItem.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}