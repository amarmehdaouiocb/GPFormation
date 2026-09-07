import { describe, expect, it } from "vitest";
import {
  DEFAULT_RECOVERY_CHANNEL,
  isRecoveryChannel,
  normalizeRecoveryChannel,
  RECOVERY_CHANNEL_LABELS,
  RECOVERY_CHANNELS,
} from "./recovery-channel";

describe("isRecoveryChannel", () => {
  it("accepts every whitelisted channel", () => {
    for (const channel of RECOVERY_CHANNELS) {
      expect(isRecoveryChannel(channel)).toBe(true);
    }
  });

  it("rejects unknown, empty and non-string values", () => {
    expect(isRecoveryChannel("autoecole")).toBe(false);
    expect(isRecoveryChannel("")).toBe(false);
    expect(isRecoveryChannel(undefined)).toBe(false);
    expect(isRecoveryChannel(null)).toBe(false);
    expect(isRecoveryChannel(42)).toBe(false);
    expect(isRecoveryChannel({ toString: () => "ecolegallieni" })).toBe(false);
    expect(isRecoveryChannel(["ecolegallieni"])).toBe(false);
  });

  it("is case sensitive and ignores surrounding whitespace variants", () => {
    expect(isRecoveryChannel("EcoleGallieni")).toBe(false);
    expect(isRecoveryChannel("ECOLEGALLIENI")).toBe(false);
    expect(isRecoveryChannel(" ecolegallieni")).toBe(false);
    expect(isRecoveryChannel("ecolegallieni\n")).toBe(false);
  });

  it("rejects injection attempts", () => {
    expect(isRecoveryChannel("ecolegallieni; Path=/")).toBe(false);
    expect(isRecoveryChannel("<script>alert(1)</script>")).toBe(false);
    expect(isRecoveryChannel("ecolegallieni,gpformation")).toBe(false);
    expect(isRecoveryChannel("__proto__")).toBe(false);
    expect(isRecoveryChannel("constructor")).toBe(false);
  });
});

describe("normalizeRecoveryChannel", () => {
  it("returns valid channels unchanged", () => {
    expect(normalizeRecoveryChannel("ecolegallieni")).toBe("ecolegallieni");
    expect(normalizeRecoveryChannel("gpformation")).toBe("gpformation");
  });

  it("falls back to the default channel for anything else", () => {
    expect(normalizeRecoveryChannel(undefined)).toBe(DEFAULT_RECOVERY_CHANNEL);
    expect(normalizeRecoveryChannel(null)).toBe(DEFAULT_RECOVERY_CHANNEL);
    expect(normalizeRecoveryChannel("")).toBe(DEFAULT_RECOVERY_CHANNEL);
    expect(normalizeRecoveryChannel("Ecolegallieni")).toBe(DEFAULT_RECOVERY_CHANNEL);
    expect(normalizeRecoveryChannel("ecolegallieni' OR 1=1")).toBe(
      DEFAULT_RECOVERY_CHANNEL,
    );
    expect(normalizeRecoveryChannel(0)).toBe(DEFAULT_RECOVERY_CHANNEL);
  });

  it("has a label for every channel", () => {
    for (const channel of RECOVERY_CHANNELS) {
      expect(RECOVERY_CHANNEL_LABELS[channel]).toEqual(expect.any(String));
      expect(RECOVERY_CHANNEL_LABELS[channel].length).toBeGreaterThan(0);
    }
  });
});
