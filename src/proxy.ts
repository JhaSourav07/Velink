// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Only run the proxy on these specific paths, let /[slug] pass through to our route.ts
  matcher: ["/dashboard/:path*", "/login"],
};