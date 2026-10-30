import { useSyncExternalStore } from "react";
import type { BookState, DayHours, PayMethod, Policy, Service } from "./book-types";
import { demoCheckout, type DemoCheckoutInput } from "./demo-checkout";
import {
  addBlock,
  bookAppointment,
  cancelAppointment,
  emptyBook,
  markCompleted,
  markNoShow,
  removeBlock,
  rescheduleAppointment,
  updateClientNote,
  updatePolicy,
  updateService,
  updateStaffHours,
  type BookInput,
} from "./engine";
import { createSeed } from "./seed";

export type OwnerSession = { email: string; name: string };

export type Data = {
  ready: boolean;
  book: BookState;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  savedShopIds: string[];
  installDismissed: boolean;
  owner: OwnerSession | null;
};

const EMPTY: Data = {
  ready: false,
  book: emptyBook(),
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  savedShopIds: [],
  installDismissed: false,
  owner: null,
};

const KEY = "b-and-s.v1";
let data: Data = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function write(next: Data) {
  data = next;
  if (typeof localStorage !== "undefined") {
    const { ready: _ready, ...stored } = next;
    localStorage.setItem(KEY, JSON.stringify(stored));
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

function freshSeed(): BookState {
  return createSeed(new Date());
}

export function hydrateStore() {
  if (typeof localStorage === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      write({ ...EMPTY, ready: true, book: freshSeed() });
      return;
    }
    const parsed = JSON.parse(raw) as Partial<Data>;
    const book = parsed.book && Array.isArray(parsed.book.shops) && parsed.book.shops.length > 0 ? parsed.book : freshSeed();
    write({
      ready: true,
      book,
      clientName: typeof parsed.clientName === "string" ? parsed.clientName : "",
      clientEmail: typeof parsed.clientEmail === "string" ? parsed.clientEmail : "",
      clientPhone: typeof parsed.clientPhone === "string" ? parsed.clientPhone : "",
      savedShopIds: Array.isArray(parsed.savedShopIds) ? parsed.savedShopIds.filter((id) => typeof id === "string") : [],
      installDismissed: Boolean(parsed.installDismissed),
      owner: parsed.owner && typeof parsed.owner.email === "string" ? parsed.owner : null,
    });
  } catch {
    write({ ...EMPTY, ready: true, book: freshSeed() });
  }
}

export function resetDemoBook() {
  write({ ...data, ready: true, book: freshSeed() });
}

function id(prefix: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `${prefix}_${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function rememberClient(client: { name: string; email: string; phone: string }) {
  write({ ...data, clientName: client.name, clientEmail: client.email, clientPhone: client.phone });
}

export function toggleSavedShop(shopId: string) {
  const savedShopIds = data.savedShopIds.includes(shopId)
    ? data.savedShopIds.filter((item) => item !== shopId)
    : [...data.savedShopIds, shopId];
  write({ ...data, savedShopIds });
}

export function dismissInstall() {
  write({ ...data, installDismissed: true });
}

export function setOwner(owner: OwnerSession) {
  write({ ...data, owner });
}

export function clearOwner() {
  write({ ...data, owner: null });
}

export function checkoutDemo(
  input: Omit<DemoCheckoutInput, "id" | "token" | "receiptId" | "clientId" | "now"> & { now?: Date },
) {
  const now = input.now ?? new Date();
  const result = demoCheckout(data.book, {
    ...input,
    id: id("apt"),
    token: id("m"),
    receiptId: id("rcpt"),
    clientId: id("client"),
    now,
  });
  if (!result.ok) return result;
  write({
    ...data,
    book: result.state,
    clientName: input.client.name,
    clientEmail: input.client.email,
    clientPhone: input.client.phone,
  });
  return result;
}

export function checkoutLive(input: Omit<BookInput, "id" | "token" | "receiptId" | "clientId" | "now"> & { now?: Date }) {
  const now = input.now ?? new Date();
  const result = bookAppointment(data.book, {
    ...input,
    id: id("apt"),
    token: id("m"),
    receiptId: id("rcpt"),
    clientId: id("client"),
    now,
  });
  if (!result.ok) return result;
  write({
    ...data,
    book: result.state,
    clientName: input.client.name,
    clientEmail: input.client.email,
    clientPhone: input.client.phone,
  });
  return result;
}

export function moveAppointment(appointmentId: string, startIso: string, staffId: string) {
  const result = rescheduleAppointment(data.book, { id: appointmentId, startIso, staffId, now: new Date() });
  if (!result.ok) return result;
  write({ ...data, book: result.state });
  return result;
}

export function cancelVisit(appointmentId: string, refundReference?: string) {
  const result = cancelAppointment(data.book, { id: appointmentId, now: new Date(), refundReference });
  if (!result.ok) return result;
  write({ ...data, book: result.state });
  return result;
}

export function saveService(service: Service) {
  write({ ...data, book: updateService(data.book, service) });
}

export function saveHours(staffId: string, weekly: DayHours[]) {
  write({ ...data, book: updateStaffHours(data.book, staffId, weekly) });
}

export function saveBlock(input: { shopId: string; staffId: string; startIso: string; endIso: string; reason: string }) {
  const result = addBlock(data.book, { ...input, id: id("block") });
  if (!result.ok) return result;
  write({ ...data, book: result.state });
  return result;
}

export function deleteBlock(blockId: string) {
  write({ ...data, book: removeBlock(data.book, blockId) });
}

export function savePolicy(shopId: string, policy: Policy) {
  write({ ...data, book: updatePolicy(data.book, shopId, policy) });
}

export function saveClientNote(clientId: string, note: string) {
  write({ ...data, book: updateClientNote(data.book, clientId, note) });
}

export function setNoShow(appointmentId: string) {
  write({ ...data, book: markNoShow(data.book, appointmentId) });
}

export function setCompleted(appointmentId: string) {
  write({ ...data, book: markCompleted(data.book, appointmentId) });
}

export type { PayMethod };
