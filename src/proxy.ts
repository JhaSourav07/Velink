// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Let the request proceed smoothly. 
  // Future: We will intercept unauthenticated users trying to hit /dashboard here.
  return NextResponse.next();
}

export const config = {
  // Optimize performance by restricting the Edge proxy to specific routes
  matcher: ["/dashboard/:path*", "/login"],
};