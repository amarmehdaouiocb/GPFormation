import { NextResponse, type NextRequest } from "next/server";
import {
  isRecoveryChannel,
  RECOVERY_CHANNEL_COOKIE,
  RECOVERY_CHANNEL_COOKIE_MAX_AGE_SECONDS,
  RECOVERY_CHANNEL_QUERY_PARAM,
} from "@/lib/recovery-channel";

export const config = {
  matcher: ["/recuperation-de-points/:path*"],
};

export function proxy(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const channel = request.nextUrl.searchParams.get(RECOVERY_CHANNEL_QUERY_PARAM);

  if (isRecoveryChannel(channel)) {
    response.cookies.set(RECOVERY_CHANNEL_COOKIE, channel, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: RECOVERY_CHANNEL_COOKIE_MAX_AGE_SECONDS,
    });
  }

  return response;
}
