import { NextRequest, NextResponse } from "next/server";
import { getAdminAliasPath, getAdminInternalPath } from "@/lib/admin-routes";
import {
  buildOrigin,
  getAdminHost,
  getPublicHost,
  isAdminHost,
} from "@/lib/domain-routing";

// ============================================================
// Proxy: Routing & Auth Protection
// ============================================================
// Admin host:
//   /login       → admin login
//   /*           → protected admin dashboard aliases
// Public host:
//   /dashboard/* → redirect to admin host clean URLs
//   /login       → redirect to admin login
//   /*           → rewrite to /home/*
function getSessionToken(request: NextRequest) {
  return (
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("__Host-better-auth.session_token")?.value
  );
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const adminHost = getAdminHost(host);
  const publicHost = getPublicHost(host);
  const isAdminDomain = isAdminHost(host);
  const sessionToken = getSessionToken(request);

  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname === "/image" ||
    url.pathname.startsWith("/static/") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!isAdminDomain && url.pathname === "/login") {
    return NextResponse.redirect(
      new URL(`${buildOrigin(protocol, adminHost)}/login`)
    );
  }

  if (!isAdminDomain && url.pathname.startsWith("/dashboard")) {
    const adminAliasPath = getAdminAliasPath(url.pathname) ?? "/";

    return NextResponse.redirect(
      new URL(`${buildOrigin(protocol, adminHost)}${adminAliasPath}${url.search}`)
    );
  }

  if (isAdminDomain) {
    if (url.pathname === "/") {
      if (!sessionToken) {
        return NextResponse.redirect(
          new URL(`${buildOrigin(protocol, adminHost)}/login`)
        );
      }

      url.pathname = "/dashboard";
      return NextResponse.rewrite(url);
    }

    if (url.pathname === "/login") {
      if (sessionToken) {
        return NextResponse.redirect(
          new URL(`${buildOrigin(protocol, adminHost)}/`)
        );
      }

      url.pathname = "/home/login";
      return NextResponse.rewrite(url);
    }

    const adminAliasPath = getAdminAliasPath(url.pathname);
    if (adminAliasPath) {
      return NextResponse.redirect(
        new URL(`${buildOrigin(protocol, adminHost)}${adminAliasPath}${url.search}`)
      );
    }

    const adminInternalPath = getAdminInternalPath(url.pathname);
    if (adminInternalPath) {
      if (!sessionToken) {
        return NextResponse.redirect(
          new URL(`${buildOrigin(protocol, adminHost)}/login`)
        );
      }

      url.pathname = adminInternalPath;
      return NextResponse.rewrite(url);
    }

    return NextResponse.redirect(
      new URL(`${buildOrigin(protocol, publicHost)}${url.pathname}${url.search}`)
    );
  }

  if (!url.pathname.startsWith("/home")) {
    url.pathname = `/home${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|image|_next/static|_next/image|favicon.ico).*)",
  ],
};
