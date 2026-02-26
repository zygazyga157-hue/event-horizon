/**
 * Edge Proxy for Gate protection
 * Protects /library/* routes - requires ACTIVE pass
 */
import { NextRequest, NextResponse } from "next/server";

// Routes that require an active gate pass
const PROTECTED_PATHS = ["/library"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path requires protection
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("gate_pass")?.value;

  if (!token) {
    // No pass - redirect to gate
    const url = request.nextUrl.clone();
    url.pathname = "/gate";
    url.searchParams.set("reason", "no_pass");
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // For Edge runtime, we can't use the full iron library
  // We'll verify the token server-side via API call
  // For now, check token exists and let API routes do full verification
  
  // In production, you'd use a lightweight Edge-compatible verification
  // or call an API route to verify

  // Token exists - let request proceed
  // The actual page/API will do full session verification
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths starting with /library
     * Exclude static files and API routes
     */
    "/library/:path*",
  ],
};
