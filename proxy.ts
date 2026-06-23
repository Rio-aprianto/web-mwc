import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAdminSession = Boolean(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!hasAdminSession && pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { message: "Unauthorized. Silakan login kembali." },
      { status: 401 },
    );
  }

  if (!hasAdminSession && pathname.startsWith("/admin")) {
    const loginUrl = new URL("/auth", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (hasAdminSession && pathname === "/auth") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/auth"],
};
