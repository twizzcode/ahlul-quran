import { NextRequest, NextResponse } from "next/server";
import { getPublicHost, isAdminHost } from "@/lib/routing/domain-routing";

function getPublicUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const publicHost = getPublicHost(host);
  const [hostname, port] = publicHost.split(":");

  url.hostname = hostname;
  url.port = port ?? "";
  url.pathname = "/";
  url.search = "";
  return url;
}

async function canAccessAdmin(request: NextRequest) {
  const checkUrl = request.nextUrl.clone();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const publicHost = getPublicHost(host);
  const [hostname, port] = publicHost.split(":");

  checkUrl.hostname = hostname;
  checkUrl.port = port ?? "";
  checkUrl.pathname = "/api/admin-access";
  checkUrl.search = "";

  try {
    const response = await fetch(checkUrl, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  const isPublicAsset = /\.[a-z0-9]+$/i.test(pathname);

  // Jangan rewrite API, asset Next.js, dan file publik seperti logo/image/font.
  if (
    isPublicAsset ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const isAdminSubdomain = isAdminHost(host);

  if (isAdminSubdomain) {
    const allowed = await canAccessAdmin(request);

    if (!allowed) {
      return NextResponse.redirect(getPublicUrl(request));
    }

    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }

    if (!pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
