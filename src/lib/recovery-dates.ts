export interface RecoverySession {
  start: string;
  end: string;
}

const recoveryDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Paris",
});

export const RECOVERY_SESSIONS: RecoverySession[] = [
  { start: "2026-09-04", end: "2026-09-05" },
  { start: "2026-09-18", end: "2026-09-19" },
  { start: "2026-09-25", end: "2026-09-26" },
  { start: "2026-10-09", end: "2026-10-10" },
  { start: "2026-10-23", end: "2026-10-24" },
  { start: "2026-10-30", end: "2026-10-31" },
  { start: "2026-11-06", end: "2026-11-07" },
  { start: "2026-11-20", end: "2026-11-21" },
  { start: "2026-11-27", end: "2026-11-28" },
  { start: "2026-12-04", end: "2026-12-05" },
  { start: "2026-12-18", end: "2026-12-19" },
];

function getParisDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getUpcomingRecoverySessions(
  referenceDate: Date = new Date(),
): RecoverySession[] {
  const today = getParisDateKey(referenceDate);

  return RECOVERY_SESSIONS.filter((session) => session.end >= today).slice(0, 5);
}

export function formatRecoveryDate(date: string): string {
  return recoveryDateFormatter.format(new Date(`${date}T12:00:00Z`));
}

export function formatRecoveryDateRange(session: RecoverySession): string {
  return `${formatRecoveryDate(session.start)} — ${formatRecoveryDate(session.end)}`;
}
