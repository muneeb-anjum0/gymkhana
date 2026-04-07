import { NextResponse } from "next/server";

import { getFirebaseSessionCookieName } from "@/lib/firebase/config";
import { getFirebaseAdminAuth } from "@/lib/firebase/server";

const sessionDurationInMilliseconds = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { idToken?: string } | null;

  if (!payload?.idToken) {
    return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
  }

  const auth = getFirebaseAdminAuth();

  if (!auth) {
    return NextResponse.json({ error: "Firebase admin credentials are not configured." }, { status: 500 });
  }

  const sessionCookie = await auth.createSessionCookie(payload.idToken, {
    expiresIn: sessionDurationInMilliseconds,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getFirebaseSessionCookieName(), sessionCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(sessionDurationInMilliseconds / 1000),
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getFirebaseSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
