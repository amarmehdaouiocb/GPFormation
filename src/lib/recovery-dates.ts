export interface RecoverySession {
  start: string;
  end: string;
  capacity?: number;
  status?: "open" | "closed";
  paidCount?: number;
  pendingCount?: number;
  remainingPlaces?: number;
  deletedAt?: string | null;
}

const recoveryDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Paris",
});

export function formatRecoveryDate(date: string): string {
  return recoveryDateFormatter.format(new Date(`${date}T12:00:00Z`));
}

export function formatRecoveryDateRange(session: RecoverySession): string {
  return `${formatRecoveryDate(session.start)} — ${formatRecoveryDate(session.end)}`;
}
