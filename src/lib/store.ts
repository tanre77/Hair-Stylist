import { useSyncExternalStore } from "react";

export type PayMethod = "venmo" | "apple";

export type ExtraTip = {
  id: string;
  amount: number;
  method: PayMethod;
  status: "awaiting" | "paid";
  at: string;
};

export type Booking = {
  id: string;
  stylistId: string;
  serviceName: string;
  whenIso: string;
  price: number;
  tip: number;
  method: PayMethod;
  status: "awaiting" | "paid";
  clientName: string;
  venmo: string;
  note: string;
  createdAt: string;
  extraTips: ExtraTip[];
};

type Data = {
  clientName: string;
  savedIds: string[];
  bookings: Booking[];
  installDismissed: boolean;
};

const EMPTY: Data = {
  clientName: "",
  savedIds: [],
  bookings: [],
  installDismissed: false,
};

const KEY = "hair-stylist.v1";
let data: Data = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function write(next: Data) {
  data = next;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore() {
  return useSyncExternalStore(subscribe, () => data, () => EMPTY);
}

function isBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false;
  const b = value as Booking;
  return typeof b.id === "string" && typeof b.stylistId === "string" && typeof b.serviceName === "string";
}

export function hydrateStore() {
  if (typeof localStorage === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<Data>;
    data = {
      clientName: typeof parsed.clientName === "string" ? parsed.clientName : "",
      savedIds: Array.isArray(parsed.savedIds) ? parsed.savedIds.filter((id) => typeof id === "string") : [],
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings.filter(isBooking).map((b) => ({ ...b, extraTips: b.extraTips ?? [], note: b.note ?? "" })) : [],
      installDismissed: Boolean(parsed.installDismissed),
    };
    emit();
  } catch {
    data = EMPTY;
  }
}

export function setClientName(clientName: string) {
  write({ ...data, clientName });
}

export function toggleSaved(id: string) {
  const savedIds = data.savedIds.includes(id) ? data.savedIds.filter((s) => s !== id) : [...data.savedIds, id];
  write({ ...data, savedIds });
}

export function dismissInstall() {
  write({ ...data, installDismissed: true });
}

export function addBooking(booking: Booking) {
  write({ ...data, bookings: [booking, ...data.bookings], clientName: booking.clientName });
}

export function markBookingPaid(id: string) {
  write({
    ...data,
    bookings: data.bookings.map((b) => (b.id === id ? { ...b, status: "paid" } : b)),
  });
}

export function cancelBooking(id: string) {
  write({ ...data, bookings: data.bookings.filter((b) => b.id !== id) });
}

export function addExtraTip(bookingId: string, tip: ExtraTip) {
  write({
    ...data,
    bookings: data.bookings.map((b) => (b.id === bookingId ? { ...b, extraTips: [...b.extraTips, tip] } : b)),
  });
}

export function markTipPaid(bookingId: string, tipId: string) {
  write({
    ...data,
    bookings: data.bookings.map((b) =>
      b.id === bookingId
        ? { ...b, extraTips: b.extraTips.map((t) => (t.id === tipId ? { ...t, status: "paid" } : t)) }
        : b,
    ),
  });
}
