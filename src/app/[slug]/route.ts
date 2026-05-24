// src/app/[slug]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse, userAgent } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // In Next.js 15, params must be awaited
  const { slug } = await params;

  // 1. Ignore static files, API routes, or reserved paths
  if (
    slug.startsWith("_next") || 
    slug.startsWith("api") || 
    slug === "favicon.ico" || 
    slug === "dashboard" || 
    slug === "login"
  ) {
    return NextResponse.next();
  }

  try {
    // 2. Look up the slug in the database
    // We check against the current domain to support custom domains later
    const host = req.headers.get("host") || "localhost:3000";
    const domain = host.split(":")[0]; // strips port for localhost

    const link = await prisma.link.findFirst({
      where: {
        slug: slug,
        domain: domain === "localhost" ? "localhost" : domain,
      },
    });

    // If no link is found, redirect to the homepage
    if (!link) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 3. Extract Analytics (Device, OS, Browser, Location)
    const { device, browser, os } = userAgent(req);
    
    // Vercel automatically injects geolocation headers in production
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const city = req.headers.get("x-vercel-ip-city") || "Unknown";
    
    // Parse the referer to see where the traffic came from (Twitter, LinkedIn, etc.)
    const refererHeader = req.headers.get("referer");
    let referer = "Direct";
    if (refererHeader && !refererHeader.includes(host)) {
      try {
        referer = new URL(refererHeader).hostname;
      } catch {
        referer = refererHeader;
      }
    }

    // 4. Record the Click asynchronously 
    // (We await this now, but in a multi-million click system, we'd push this to an Upstash Queue)
    await prisma.click.create({
      data: {
        linkId: link.id,
        country,
        city,
        device: device.type === "mobile" ? "Mobile" : device.type === "tablet" ? "Tablet" : "Desktop",
        browser: browser.name || "Unknown",
        os: os.name || "Unknown",
        referer,
      }
    });

    // 5. Execute the 302 Redirect to the original destination
    return NextResponse.redirect(link.url);

  } catch (error) {
    console.error("Redirect Engine Error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}