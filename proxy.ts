import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

const PUBLIC_PATHS = ["/"];
const REDIRECT_TO_FOR_LOGIN = "/";
const REDIRECT_TO_WHEN_LOGGED_IN = "/success/login";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // Not logged in
  if (!session && !isPublicPath) {
    const loginUrl = new URL(REDIRECT_TO_FOR_LOGIN, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // logged in
  if (session && isPublicPath) {
    return NextResponse.redirect(new URL(REDIRECT_TO_WHEN_LOGGED_IN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};