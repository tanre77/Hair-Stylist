export const MINUTE = 60_000;

export function startOfDay(day: Date): Date {
  const next = new Date(day);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function atMinutes(day: Date, minutes: number): Date {
  const next = startOfDay(day);
  next.setHours(0, 0, 0, 0);
  next.setMinutes(minutes);
  return next;
}

export function formatClock(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const hr = h % 12 || 12;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${hr}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export function minutesToTimeValue(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function timeValueToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : h === 1 ? "1 hr" : `${h} hr`;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addDays(day: Date, count: number): Date {
  const next = startOfDay(day);
  next.setDate(next.getDate() + count);
  return next;
}

/** Monday-first week that contains `anchor`. */
export function weekOf(anchor: Date): Date[] {
  const start = startOfDay(anchor);
  const mondayOffset = (start.getDay() + 6) % 7;
  const monday = addDays(start, -mondayOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function upcomingDays(count: number, now: Date): Date[] {
  const start = startOfDay(now);
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function weekdayName(index: number): string {
  return WEEKDAYS[index] ?? "";
}

export function weekdayLong(index: number): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][index] ?? "";
}
