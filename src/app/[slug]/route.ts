// src/app/[slug]/route.ts
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse, userAgent } from "next/server";

interface LinkCache {
  id: string;
  url: string;
  hasPassword: boolean;
  expiresAt: string | null;
  archived?: boolean;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (
    slug.startsWith("_next") || 
    slug.startsWith("api") || 
    slug === "favicon.ico" || 
    slug === "dashboard" || 
    slug === "login" ||
    slug === "p"
  ) {
    return NextResponse.next();
  }

  try {
    const host = req.headers.get("host") || "localhost:3000";
    const domain = host.split(":")[0];
    const cacheKey = `link:${domain}:${slug}`;
    
    // 1. CACHE LOOKUP
    let linkData: LinkCache | null = await redis.get<LinkCache>(cacheKey);

    // 2. DATABASE FALLBACK
    if (!linkData) {
      const link = await prisma.link.findFirst({
        where: { slug, domain: domain === "localhost" ? "localhost" : domain },
      });

      if (!link) return NextResponse.redirect(new URL("/", req.url));

      linkData = {
        id: link.id,
        url: link.url,
        hasPassword: link.password !== null,
        expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
        archived: link.archived,
      };

      // Cache the JSON payload for 24h (non-fatal if cache unavailable)
      try {
        await redis.set(cacheKey, linkData, { ex: 86400 });
      } catch (cacheErr) {
        console.warn("Non-fatal Redis cache write error in redirect:", cacheErr);
      }
    }

    // 3. ARCHIVED CHECK
    if (linkData.archived) {
      return NextResponse.redirect(new URL("/?error=archived", req.url));
    }

    // 4. SECURITY INTERCEPT: Expiration Check
    if (linkData.expiresAt && new Date(linkData.expiresAt) < new Date()) {
      return NextResponse.redirect(new URL("/?error=expired", req.url));
    }

    // 5. SECURITY INTERCEPT: Password Check
    if (linkData.hasPassword) {
      return NextResponse.redirect(new URL(`/p/${slug}?d=${domain}`, req.url));
    }

    // 6. EXECUTE STANDARD REDIRECT
    const response = NextResponse.redirect(linkData.url);

    // 7. ASYNC ANALYTICS
    const { device, browser, os } = userAgent(req);
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const city = req.headers.get("x-vercel-ip-city") || "Unknown";
    const refererHeader = req.headers.get("referer");
    
    let referer = "Direct";
    if (refererHeader && !refererHeader.includes(host)) {
      try { referer = new URL(refererHeader).hostname; } catch { referer = refererHeader; }
    }

    prisma.click.create({
      data: {
        linkId: linkData.id,
        country, city, referer,
        device: device.type === "mobile" ? "Mobile" : device.type === "tablet" ? "Tablet" : "Desktop",
        browser: browser.name || "Unknown",
        os: os.name || "Unknown",
      }
    }).catch(err => console.error("Analytics Error:", err));

    return response;

  } catch (error) {
    console.error("Redirect Error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}