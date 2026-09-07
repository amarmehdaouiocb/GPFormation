import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { RECOVERY_CHANNEL_COOKIE } from "./lib/recovery-channel";
import { config, proxy } from "./proxy";

function run(url: string) {
  return proxy(new NextRequest(url));
}

describe("recovery channel proxy", () => {
  it("only runs on the recovery registration page", () => {
    expect(config.matcher).toEqual(["/recuperation-de-points/:path*"]);
  });

  it("sets a first-touch cookie when a valid channel is provided", () => {
    const response = run(
      "https://www.gpformation.fr/recuperation-de-points?canal=ecolegallieni&session=2026-10-05",
    );
    const cookie = response.cookies.get(RECOVERY_CHANNEL_COOKIE);

    expect(cookie?.value).toBe("ecolegallieni");
    expect(cookie).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  });

  it("does not redirect and keeps the request untouched", () => {
    const response = run(
      "https://www.gpformation.fr/recuperation-de-points?canal=ecolegallieni",
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("does not set a cookie without a channel parameter", () => {
    const response = run(
      "https://www.gpformation.fr/recuperation-de-points?session=2026-10-05",
    );

    expect(response.cookies.get(RECOVERY_CHANNEL_COOKIE)).toBeUndefined();
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.status).toBe(200);
  });

  it("ignores invalid, empty or spoofed channels", () => {
    for (const canal of [
      "",
      "autoecole",
      "EcoleGallieni",
      "ecolegallieni%3B%20Path%3D%2Fadmin",
      "%3Cscript%3E",
    ]) {
      const response = run(
        `https://www.gpformation.fr/recuperation-de-points?canal=${canal}`,
      );

      expect(response.cookies.get(RECOVERY_CHANNEL_COOKIE)).toBeUndefined();
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("lets a new valid channel replace the existing cookie (last click wins)", () => {
    const request = new NextRequest(
      "https://www.gpformation.fr/recuperation-de-points?canal=ecolegallieni",
      { headers: { cookie: `${RECOVERY_CHANNEL_COOKIE}=gpformation` } },
    );

    expect(proxy(request).cookies.get(RECOVERY_CHANNEL_COOKIE)?.value).toBe(
      "ecolegallieni",
    );
  });
});
