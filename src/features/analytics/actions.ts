// src/features/analytics/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getWorkspaceAnalytics() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!workspaceMember) return { error: "Workspace not found" };

    // 1. Get all links for this workspace
    const links = await prisma.link.findMany({
      where: { workspaceId: workspaceMember.workspaceId },
      select: { id: true },
    });

    const linkIds = links.map((link) => link.id);

    // 2. Fetch all clicks for these links
    const clicks = await prisma.click.findMany({
      where: { linkId: { in: linkIds } },
      orderBy: { timestamp: "asc" },
    });

    // 3. Aggregate Total Clicks
    const totalClicks = clicks.length;

    // 4. Aggregate Time Series (Clicks per day for the chart)
    const clicksByDate = clicks.reduce((acc: Record<string, number>, click) => {
      // Format as "MMM D" (e.g., "May 25")
      const date = click.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Ensure we at least have today's date if there are no clicks
    if (Object.keys(clicksByDate).length === 0) {
      const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      clicksByDate[today] = 0;
    }

    const chartData = Object.entries(clicksByDate).map(([date, count]) => ({
      date,
      clicks: count,
    }));

    // 5. Aggregate Devices
    const devices = clicks.reduce((acc: Record<string, number>, click) => {
      const device = click.device || "Desktop";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    const deviceData = Object.entries(devices).map(([name, count]) => ({
      name,
      count,
      percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
    }));

    // 6. Aggregate Countries
    const countries = clicks.reduce((acc: Record<string, number>, click) => {
      const country = click.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const countryData = Object.entries(countries)
      .map(([name, count]) => ({
        name: name === "Unknown" ? "Localhost / Unknown" : name,
        code: name === "Unknown" ? "🌐" : name, // Use actual flags via a library later
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count); // Sort highest first

    return {
      success: true,
      data: {
        totalClicks,
        chartData,
        deviceData,
        countryData,
      },
    };
  } catch (error) {
    console.error("Analytics Error:", error);
    return { error: "Failed to fetch analytics" };
  }
}