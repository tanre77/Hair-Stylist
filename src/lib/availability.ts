import { MINUTE } from "./time.ts";

export type Interval = { startMs: number; endMs: number };

export type SlotOption = {
  startIso: string;
  label: string;
  staffId: string;
  staffName: string;
};

export const SLOT_STEP_MIN = 15;

export function rangesOverlap(a: Interval, b: Interval): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs;
}

/** Occupied span includes the buffers on either side of the service. */
export function occupiedWindow(
  startMs: number,
  durationMin: number,
  bufferBeforeMin: number,
  bufferAfterMin: number,
): Interval {
  return {
    startMs: startMs - bufferBeforeMin * MINUTE,
    endMs: startMs + (durationMin + bufferAfterMin) * MINUTE,
  };
}

export function slotsForStaff(input: {
  day: Date;
  now: Date;
  openMin: number | null;
  closeMin: number | null;
  durationMin: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  busy: Interval[];
  staffId: string;
  staffName: string;
  stepMin?: number;
}): SlotOption[] {
  const { openMin, closeMin } = input;
  if (openMin === null || closeMin === null) return [];
  if (closeMin <= openMin) return [];
  const step = input.stepMin ?? SLOT_STEP_MIN;
  const slots: SlotOption[] = [];
  const earliest = openMin + input.bufferBeforeMin;
  const latestStart = closeMin - input.durationMin - input.bufferAfterMin;
  for (let minutes = earliest; minutes <= latestStart; minutes += step) {
    const start = new Date(input.day);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(minutes);
    if (start.getTime() <= input.now.getTime()) continue;
    const window = occupiedWindow(
      start.getTime(),
      input.durationMin,
      input.bufferBeforeMin,
      input.bufferAfterMin,
    );
    if (input.busy.some((busy) => rangesOverlap(window, busy))) continue;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hr = h % 12 || 12;
    const suffix = h >= 12 ? "PM" : "AM";
    slots.push({
      startIso: start.toISOString(),
      label: `${hr}:${m.toString().padStart(2, "0")} ${suffix}`,
      staffId: input.staffId,
      staffName: input.staffName,
    });
  }
  return slots;
}

/**
 * One option per clock time. The chair goes to whoever has the lighter book
 * that day, then the earlier staff id, so the choice is stable.
 */
export function slotsForAnyStaff(input: {
  day: Date;
  now: Date;
  durationMin: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  stepMin?: number;
  staff: Array<{
    staffId: string;
    staffName: string;
    openMin: number | null;
    closeMin: number | null;
    busy: Interval[];
    dayCount: number;
  }>;
}): SlotOption[] {
  const byTime = new Map<string, { slot: SlotOption; dayCount: number }>();
  for (const member of input.staff) {
    const slots = slotsForStaff({
      day: input.day,
      now: input.now,
      openMin: member.openMin,
      closeMin: member.closeMin,
      durationMin: input.durationMin,
      bufferBeforeMin: input.bufferBeforeMin,
      bufferAfterMin: input.bufferAfterMin,
      busy: member.busy,
      staffId: member.staffId,
      staffName: member.staffName,
      stepMin: input.stepMin,
    });
    for (const slot of slots) {
      const current = byTime.get(slot.startIso);
      if (
        !current ||
        member.dayCount < current.dayCount ||
        (member.dayCount === current.dayCount && slot.staffId < current.slot.staffId)
      ) {
        byTime.set(slot.startIso, { slot, dayCount: member.dayCount });
      }
    }
  }
  return [...byTime.values()]
    .map((entry) => entry.slot)
    .sort((a, b) => a.startIso.localeCompare(b.startIso));
}
