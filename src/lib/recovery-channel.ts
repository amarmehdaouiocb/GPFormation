export const RECOVERY_CHANNELS = ["gpformation", "ecolegallieni"] as const;

export type RecoveryChannel = (typeof RECOVERY_CHANNELS)[number];

export const DEFAULT_RECOVERY_CHANNEL: RecoveryChannel = "gpformation";

export const RECOVERY_CHANNEL_QUERY_PARAM = "canal";

export const RECOVERY_CHANNEL_COOKIE = "gp_recovery_channel";

export const RECOVERY_CHANNEL_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const RECOVERY_CHANNEL_LABELS: Record<RecoveryChannel, string> = {
  gpformation: "GP Formation",
  ecolegallieni: "Ecole Gallieni",
};

export function isRecoveryChannel(value: unknown): value is RecoveryChannel {
  return (
    typeof value === "string" &&
    (RECOVERY_CHANNELS as readonly string[]).includes(value)
  );
}

export function normalizeRecoveryChannel(value: unknown): RecoveryChannel {
  return isRecoveryChannel(value) ? value : DEFAULT_RECOVERY_CHANNEL;
}
