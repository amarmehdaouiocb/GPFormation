import { NextResponse } from "next/server";
import { formatRecoveryDateRange } from "@/lib/recovery-dates";
import { getUpcomingRecoverySessions } from "@/lib/recovery-registration";

export const dynamic = "force-dynamic";

/**
 * Public, read-only list of the upcoming open recovery sessions.
 *
 * Consumed by partner sites (e.g. the Ecole Gallieni WordPress plugin in
 * `services/wordpress`) so that gpformation.fr stays the single source of
 * truth for session dates. Only dates are exposed: capacities, counts and
 * internal identifiers never leave the server.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const sessions = await getUpcomingRecoverySessions();

    return NextResponse.json(
      {
        sessions: sessions.map((session) => ({
          start: session.start,
          end: session.end,
          label: formatRecoveryDateRange(session),
        })),
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Unable to load public recovery sessions", error);

    return NextResponse.json(
      { sessions: [], error: "Recovery sessions are temporarily unavailable" },
      {
        status: 503,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
