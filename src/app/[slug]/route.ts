// src/app/[slug]/route.ts
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse, userAgent } from "next/server";

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
    slug === "login"
  ) {
    return NextResponse.next();
  }

  try {
    const host = req.headers.get("host") || "localhost:3000";
    const domain = host.split(":")[0];
    
    const cacheKey = `link:${domain}:${slug}`;
    let linkId: string | null = null;

    let destinationUrl = await redis.get<string>(cacheKey);

    if (!destinationUrl) {
      const link = await prisma.link.findFirst({
        where: {
          slug: slug,
          domain: domain === "localhost" ? "localhost" : domain,
        },
      });

      if (!link) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      destinationUrl = link.url;
      linkId = link.id;

      await redis.set(cacheKey, destinationUrl, { ex: 86400 });
    }

    const response = NextResponse.redirect(destinationUrl);

    const { device, browser, os } = userAgent(req);
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const city = req.headers.get("x-vercel-ip-city") || "Unknown";
    const refererHeader = req.headers.get("referer");
    
    let referer = "Direct";
    if (refererHeader && !refererHeader.includes(host)) {
      try { referer = new URL(refererHeader).hostname; } 
      catch { referer = refererHeader; }
    }

    if (!linkId) {
       const cachedLink = await prisma.link.findFirst({ select: { id: true }, where: { slug, domain }});
       if (cachedLink) linkId = cachedLink.id;
    }

    if (linkId) {
      prisma.click.create({
        data: {
          linkId: linkId,
          country,
          city,
          device: device.type === "mobile" ? "Mobile" : device.type === "tablet" ? "Tablet" : "Desktop",
          browser: browser.name || "Unknown",
          os: os.name || "Unknown",
          referer,
        }
      }).catch(err => console.error("Failed to log async analytics:", err));
    }

    return response;

  } catch (error) {
    console.error("Redirect Engine Error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}