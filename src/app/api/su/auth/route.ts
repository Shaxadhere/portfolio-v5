import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getExpectedCredentials,
  getSuSession,
  SU_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/su-auth";

export async function GET() {
  const session = await getSuSession();
  if (!session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: session.username });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const expected = getExpectedCredentials();

    if (
      !username ||
      !password ||
      username.trim().toLowerCase() !== expected.username.toLowerCase() ||
      password !== expected.password
    ) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(username.trim());

    const response = NextResponse.json({
      success: true,
      username: username.trim(),
    });

    response.cookies.set({
      name: SU_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, loggedOut: true });
  response.cookies.set({
    name: SU_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
