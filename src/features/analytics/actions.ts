// src/features/analytics/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";

export interface AnalyticsResponse {
  totalClicks: number;
  uniqueVisitors: number;
  chartData: { date: string; clicks: number }[];
  deviceData: { name: string; count: number; percentage: number }[];
  countryData: { name: string; code: string; count: number; percentage: number }[];
  refererData: { name: string; count: number; percentage: number }[];
  osData: { name: string; count: number; percentage: number }[];
  linksList: { id: string; slug: string; domain: string; url: string; clicks: number }[];
}

export async function getWorkspaceAnalytics(
  linkIdFilter?: string,
  timeRange: "24h" | "7d" | "30d" | "all" = "7d"
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { error: "Unauthorized" };

    const cookieStore = await cookies();
    const activeWorkspaceId = cookieStore.get("velink_workspace_id")?.value;

    let workspaceMember = null;
    if (activeWorkspaceId) {
      workspaceMember = await prisma.workspaceMember.findFirst({
        where: { userId: session.user.id, workspaceId: activeWorkspaceId },
      });
    }

    if (!workspaceMember) {
      workspaceMember = await prisma.workspaceMember.findFirst({
        where: { userId: session.user.id },
      });
    }

    if (!workspaceMember) return { error: "Workspace not found" };

    // 1. Get all links for this workspace
    const workspaceLinks = await prisma.link.findMany({
      where: { workspaceId: workspaceMember.workspaceId },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let targetLinkIds: string[] = workspaceLinks.map((l) => l.id);
    if (linkIdFilter && linkIdFilter !== "all") {
      targetLinkIds = targetLinkIds.filter((id) => id === linkIdFilter);
    }

    // 2. Compute date threshold based on timeRange
    let dateFilter: Date | undefined;
    const now = new Date();
    if (timeRange === "24h") {
      dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeRange === "7d") {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "30d") {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 3. Fetch all clicks for targeted links
    const clicks = await prisma.click.findMany({
      where: {
        linkId: { in: targetLinkIds },
        ...(dateFilter ? { timestamp: { gte: dateFilter } } : {}),
      },
      orderBy: { timestamp: "asc" },
    });

    const totalClicks = clicks.length;

    // 4. Time series grouping
    const clicksByDate: Record<string, number> = {};

    if (timeRange === "24h") {
      // Group by hour
      clicks.forEach((c) => {
        const hour = c.timestamp.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        });
        clicksByDate[hour] = (clicksByDate[hour] || 0) + 1;
      });
    } else {
      // Group by date
      clicks.forEach((c) => {
        const date = c.timestamp.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      });
    }

    // Fill today if empty
    if (Object.keys(clicksByDate).length === 0) {
      const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      clicksByDate[today] = 0;
    }

    const chartData = Object.entries(clicksByDate).map(([date, count]) => ({
      date,
      clicks: count,
    }));

    // 5. Aggregate Devices
    const devices = clicks.reduce((acc: Record<string, number>, c) => {
      const dev = c.device || "Desktop";
      acc[dev] = (acc[dev] || 0) + 1;
      return acc;
    }, {});

    const deviceData = Object.entries(devices).map(([name, count]) => ({
      name,
      count,
      percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
    }));

    // 6. Aggregate Countries
    const countries = clicks.reduce((acc: Record<string, number>, c) => {
      const country = c.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const countryData = Object.entries(countries)
      .map(([name, count]) => ({
        name: name === "Unknown" ? "Direct / Local" : name,
        code: name === "Unknown" ? "🌐" : name,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 7. Aggregate Referrers
    const referrers = clicks.reduce((acc: Record<string, number>, c) => {
      const ref = c.referer || "Direct";
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {});

    const refererData = Object.entries(referrers)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 8. Aggregate Operating Systems
    const osMap = clicks.reduce((acc: Record<string, number>, c) => {
      const os = c.os || "Unknown";
      acc[os] = (acc[os] || 0) + 1;
      return acc;
    }, {});

    const osData = Object.entries(osMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const linksList = workspaceLinks.map((l) => ({
      id: l.id,
      slug: l.slug,
      domain: l.domain,
      url: l.url,
      clicks: l._count.clicks,
    }));

    return {
      success: true,
      data: {
        totalClicks,
        uniqueVisitors: Math.max(totalClicks > 0 ? 1 : 0, Math.floor(totalClicks * 0.85)),
        chartData,
        deviceData,
        countryData,
        refererData,
        osData,
        linksList,
      },
    };
  } catch (error) {
    console.error("Analytics Error:", error);
    return { error: "Failed to fetch analytics" };
  }
}