import { NextResponse, type NextRequest } from "next/server";

import { getFirebaseSessionCookieName } from "./config";

const protectedPaths = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/training",
  "/history",
  "/progress",
  "/schedule",
  "/templates",
];

const authPaths = ["/login", "/signup"];

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isAuthPath(pathname: string) {
  return authPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function proxy(request: NextRequest) {
  const sessionCookieName = getFirebaseSessionCookieName();
  const sessionCookie = request.cookies.get(sessionCookieName)?.value;

  if (!sessionCookie && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie && isAuthPath(request.nextUrl.pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";

    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next({ request: { headers: request.headers } });
}
