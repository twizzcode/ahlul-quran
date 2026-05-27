import { NextRequest, NextResponse } from "next/server";

function getPublicUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.hostname = "lvh.me";
  url.pathname = "/";
  url.search = "";
  return url;
}

async function canAccessAdmin(request: NextRequest) {
  const checkUrl = request.nextUrl.clone();
  checkUrl.hostname = "lvh.me";
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
  const hostname = host.split(":")[0];
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

  const isAdminSubdomain = hostname === "admin.lvh.me";

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
