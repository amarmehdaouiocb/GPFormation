import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getUpcomingRecoverySessions = vi.fn();
vi.mock("@/lib/recovery-registration", () => ({
  getUpcomingRecoverySessions: () => getUpcomingRecoverySessions(),
}));

import { GET } from "./route";

beforeEach(() => {
  getUpcomingRecoverySessions.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/recovery-sessions", () => {
  it("exposes only dates and a French label for each upcoming session", async () => {
    getUpcomingRecoverySessions.mockResolvedValueOnce([
      {
        start: "2026-10-05",
        end: "2026-10-06",
        capacity: 20,
        status: "open",
        paidCount: 7,
        pendingCount: 2,
        remainingPlaces: 11,
      },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      sessions: [
        {
          start: "2026-10-05",
          end: "2026-10-06",
          label: "5 octobre 2026 — 6 octobre 2026",
        },
      ],
    });
    expect(JSON.stringify(body)).not.toMatch(/capacity|paidCount|pendingCount|remainingPlaces/);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("cache-control")).toContain("s-maxage=300");
  });

  it("returns an empty list with a 503 when the store is unreachable", async () => {
    getUpcomingRecoverySessions.mockRejectedValueOnce(new Error("store down"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.sessions).toEqual([]);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
