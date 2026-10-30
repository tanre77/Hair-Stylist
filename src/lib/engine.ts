import { occupiedWindow, slotsForAnyStaff, slotsForStaff, type Interval, type SlotOption } from "./availability.ts";
import type {
  Appointment,
  Block,
  BookState,
  Client,
  DayHours,
  Payment,
  Policy,
  Receipt,
  Service,
  Staff,
} from "./book-types.ts";
import { makeReceipt } from "./card-pay.ts";
import { quoteVisit } from "./checkout.ts";
import { cents } from "./money.ts";
import { insideCancellationWindow, noShowFeeAmount, refundAmount, sanitizePolicy } from "./policies.ts";
import { sameDay } from "./time.ts";

export function emptyBook(): BookState {
  return {
    shops: [],
    staff: [],
    services: [],
    clients: [],
    appointments: [],
    blocks: [],
    receipts: [],
    policies: {},
  };
}

export function shopById(state: BookState, id: string) {
  return state.shops.find((shop) => shop.id === id);
}

export function staffById(state: BookState, id: string) {
  return state.staff.find((member) => member.id === id);
}

export function serviceById(state: BookState, id: string) {
  return state.services.find((service) => service.id === id);
}

export function clientById(state: BookState, id: string) {
  return state.clients.find((client) => client.id === id);
}

export function policyFor(state: BookState, shopId: string): Policy {
  return state.policies[shopId] ?? sanitizePolicy({});
}

export function staffForShop(state: BookState, shopId: string): Staff[] {
  return state.staff.filter((member) => member.shopId === shopId);
}

export function servicesForShop(state: BookState, shopId: string): Service[] {
  return state.services.filter((service) => service.shopId === shopId);
}

export function startingPrice(state: BookState, shopId: string): number {
  const prices = servicesForShop(state, shopId).map((service) => service.price);
  return prices.length ? Math.min(...prices) : 0;
}

export function hoursOn(member: Staff, day: Date): DayHours {
  return member.weekly[day.getDay()] ?? null;
}

function appointmentInterval(appointment: Appointment): Interval | null {
  if (appointment.status === "cancelled") return null;
  return occupiedWindow(
    new Date(appointment.startIso).getTime(),
    appointment.durationMin,
    appointment.bufferBeforeMin,
    appointment.bufferAfterMin,
  );
}

export function busyForStaff(state: BookState, staffId: string, ignoreAppointmentId?: string): Interval[] {
  const intervals: Interval[] = [];
  for (const appointment of state.appointments) {
    if (appointment.staffId !== staffId || appointment.id === ignoreAppointmentId) continue;
    const interval = appointmentInterval(appointment);
    if (interval) intervals.push(interval);
  }
  for (const block of state.blocks) {
    if (block.staffId !== staffId) continue;
    intervals.push({ startMs: new Date(block.startIso).getTime(), endMs: new Date(block.endIso).getTime() });
  }
  return intervals;
}

function dayCount(state: BookState, staffId: string, day: Date, ignoreAppointmentId?: string): number {
  return state.appointments.filter((appointment) => {
    if (appointment.staffId !== staffId || appointment.id === ignoreAppointmentId) return false;
    if (appointment.status === "cancelled") return false;
    return sameDay(new Date(appointment.startIso), day);
  }).length;
}

export function openSlots(
  state: BookState,
  input: {
    shopId: string;
    serviceId: string;
    staffId: string | "any";
    day: Date;
    now: Date;
    ignoreAppointmentId?: string;
  },
): SlotOption[] {
  const service = serviceById(state, input.serviceId);
  if (!service || service.shopId !== input.shopId) return [];
  const eligible = staffForShop(state, input.shopId).filter((member) => service.staffIds.includes(member.id));
  const chosen =
    input.staffId === "any" ? eligible : eligible.filter((member) => member.id === input.staffId);
  if (input.staffId !== "any") {
    const member = chosen[0];
    if (!member) return [];
    const hours = hoursOn(member, input.day);
    return slotsForStaff({
      day: input.day,
      now: input.now,
      openMin: hours?.openMin ?? null,
      closeMin: hours?.closeMin ?? null,
      durationMin: service.durationMin,
      bufferBeforeMin: service.bufferBeforeMin,
      bufferAfterMin: service.bufferAfterMin,
      busy: busyForStaff(state, member.id, input.ignoreAppointmentId),
      staffId: member.id,
      staffName: member.name,
    });
  }
  return slotsForAnyStaff({
    day: input.day,
    now: input.now,
    durationMin: service.durationMin,
    bufferBeforeMin: service.bufferBeforeMin,
    bufferAfterMin: service.bufferAfterMin,
    staff: chosen.map((member) => {
      const hours = hoursOn(member, input.day);
      return {
        staffId: member.id,
        staffName: member.name,
        openMin: hours?.openMin ?? null,
        closeMin: hours?.closeMin ?? null,
        busy: busyForStaff(state, member.id, input.ignoreAppointmentId),
        dayCount: dayCount(state, member.id, input.day, input.ignoreAppointmentId),
      };
    }),
  });
}

export type BookInput = {
  id: string;
  token: string;
  shopId: string;
  staffId: string;
  serviceId: string;
  clientId: string;
  startIso: string;
  client: { name: string; email: string; phone: string };
  payChoice: "deposit" | "full";
  tip: number;
  payment: Omit<Payment, "amount" | "tip">;
  now: Date;
  receiptId: string;
};

export type BookResult =
  | { ok: true; state: BookState; appointment: Appointment; receipt: Receipt }
  | { ok: false; error: string };

function slotStillOpen(state: BookState, input: BookInput, service: Service): boolean {
  const slots = openSlots(state, {
    shopId: input.shopId,
    serviceId: input.serviceId,
    staffId: input.staffId,
    day: new Date(input.startIso),
    now: input.now,
  });
  return slots.some(
    (slot) => slot.startIso === input.startIso && slot.staffId === input.staffId && service.staffIds.includes(slot.staffId),
  );
}

function upsertClient(state: BookState, input: BookInput): { clients: Client[]; client: Client } {
  const email = input.client.email.trim().toLowerCase();
  const phone = input.client.phone.trim();
  const name = input.client.name.trim();
  const existing =
    state.clients.find((client) => client.shopId === input.shopId && email && client.email.toLowerCase() === email) ??
    state.clients.find(
      (client) =>
        client.shopId === input.shopId &&
        phone &&
        client.phone === phone &&
        client.name.toLowerCase() === name.toLowerCase(),
    );
  if (existing) {
    const client = { ...existing, name, email, phone };
    return {
      client,
      clients: state.clients.map((item) => (item.id === existing.id ? client : item)),
    };
  }
  const client: Client = {
    id: input.clientId,
    shopId: input.shopId,
    name,
    email,
    phone,
    note: "",
  };
  return { client, clients: [...state.clients, client] };
}

export function bookAppointment(state: BookState, input: BookInput): BookResult {
  const shop = shopById(state, input.shopId);
  const service = serviceById(state, input.serviceId);
  const member = staffById(state, input.staffId);
  if (!shop || !service || !member || service.shopId !== shop.id || member.shopId !== shop.id) {
    return { ok: false, error: "That chair isn't on the book." };
  }
  if (!service.staffIds.includes(member.id)) {
    return { ok: false, error: "That person doesn't offer this service." };
  }
  if (input.client.name.trim().length < 2) return { ok: false, error: "Add the name for the chair." };
  if (input.tip < 0 || input.tip > 500) return { ok: false, error: "Tip should be between $0 and $500." };
  if (new Date(input.startIso).getTime() <= input.now.getTime()) {
    return { ok: false, error: "Pick a time that hasn't passed." };
  }
  if (!slotStillOpen(state, input, service)) {
    return { ok: false, error: "That time was just taken." };
  }
  const priced = quoteVisit({
    price: service.price,
    policy: policyFor(state, shop.id),
    choice: input.payChoice,
    tip: input.tip,
  });
  const { clients, client } = upsertClient(state, input);
  const appointment: Appointment = {
    id: input.id,
    token: input.token,
    shopId: shop.id,
    staffId: member.id,
    serviceId: service.id,
    clientId: client.id,
    serviceName: service.name,
    staffName: member.name,
    shopName: shop.name,
    startIso: input.startIso,
    durationMin: service.durationMin,
    bufferBeforeMin: service.bufferBeforeMin,
    bufferAfterMin: service.bufferAfterMin,
    price: service.price,
    tip: priced.tip,
    payChoice: priced.choice,
    dueToday: priced.dueToday,
    balanceAtVisit: priced.balanceAtVisit,
    status: "booked",
    payment: {
      ...input.payment,
      amount: priced.dueToday,
      tip: priced.tip,
    },
    createdAt: input.now.toISOString(),
  };
  const receipt = makeReceipt({
    id: input.receiptId,
    appointmentId: appointment.id,
    token: appointment.token,
    kind: "payment",
    at: appointment.createdAt,
    shopName: shop.name,
    serviceName: service.name,
    staffName: member.name,
    clientName: client.name,
    whenIso: appointment.startIso,
    payment: appointment.payment,
    serviceAmount: priced.serviceDue,
    tip: priced.tip,
    total: priced.dueToday,
    note:
      priced.choice === "deposit"
        ? `Deposit collected. ${priced.balanceAtVisit.toFixed(2)} remains at the chair.`
        : "Paid in full.",
  });
  return {
    ok: true,
    appointment,
    receipt,
    state: {
      ...state,
      clients,
      appointments: [...state.appointments, appointment],
      receipts: [receipt, ...state.receipts],
    },
  };
}

export function rescheduleAppointment(
  state: BookState,
  input: { id: string; startIso: string; staffId: string; now: Date },
): BookResult {
  const current = state.appointments.find((appointment) => appointment.id === input.id);
  if (!current || current.status !== "booked") return { ok: false, error: "That visit can't be moved." };
  const service = serviceById(state, current.serviceId);
  const member = staffById(state, input.staffId);
  if (!service || !member || !service.staffIds.includes(member.id)) {
    return { ok: false, error: "That person doesn't offer this service." };
  }
  const slots = openSlots(state, {
    shopId: current.shopId,
    serviceId: current.serviceId,
    staffId: input.staffId,
    day: new Date(input.startIso),
    now: input.now,
    ignoreAppointmentId: current.id,
  });
  if (!slots.some((slot) => slot.startIso === input.startIso && slot.staffId === input.staffId)) {
    return { ok: false, error: "That time was just taken." };
  }
  const appointment: Appointment = {
    ...current,
    staffId: member.id,
    staffName: member.name,
    startIso: input.startIso,
    durationMin: service.durationMin,
    bufferBeforeMin: service.bufferBeforeMin,
    bufferAfterMin: service.bufferAfterMin,
  };
  const existing = state.receipts.find(
    (receipt) => receipt.appointmentId === appointment.id && receipt.kind === "payment",
  );
  const receipt =
    existing ??
    makeReceipt({
      id: `moved_${appointment.id}`,
      appointmentId: appointment.id,
      token: appointment.token,
      kind: "payment",
      at: input.now.toISOString(),
      shopName: appointment.shopName,
      serviceName: appointment.serviceName,
      staffName: appointment.staffName,
      clientName: clientById(state, appointment.clientId)?.name ?? "Guest",
      whenIso: appointment.startIso,
      payment: appointment.payment,
      serviceAmount: appointment.dueToday - appointment.tip,
      tip: appointment.tip,
      total: appointment.dueToday,
      note: "Moved to a new time.",
    });
  return {
    ok: true,
    appointment,
    receipt,
    state: {
      ...state,
      appointments: state.appointments.map((item) => (item.id === appointment.id ? appointment : item)),
    },
  };
}

export function cancelAppointment(
  state: BookState,
  input: { id: string; now: Date; refundReference?: string },
):
  | { ok: true; state: BookState; refund: number; insideWindow: boolean }
  | { ok: false; error: string } {
  const current = state.appointments.find((appointment) => appointment.id === input.id);
  if (!current || current.status !== "booked") return { ok: false, error: "That visit is already closed." };
  const policy = policyFor(state, current.shopId);
  const insideWindow = insideCancellationWindow(current.startIso, input.now, policy.cancellationWindowHours);
  const refund = refundAmount({
    startIso: current.startIso,
    now: input.now,
    policy,
    payment: current.payment,
  });
  const client = clientById(state, current.clientId);
  const payment =
    refund > 0
      ? { ...current.payment, status: "refunded" as const, reference: input.refundReference || current.payment.reference }
      : current.payment;
  const appointment: Appointment = {
    ...current,
    status: "cancelled",
    payment,
    cancelledAt: input.now.toISOString(),
    refundAmount: refund,
  };
  const receipts = [...state.receipts];
  if (refund > 0) {
    receipts.unshift(
      makeReceipt({
        id: `refund_${current.id}`,
        appointmentId: current.id,
        token: current.token,
        kind: "refund",
        at: input.now.toISOString(),
        shopName: current.shopName,
        serviceName: current.serviceName,
        staffName: current.staffName,
        clientName: client?.name ?? "Guest",
        whenIso: current.startIso,
        payment: { ...payment, amount: refund },
        serviceAmount: refund,
        tip: 0,
        total: refund,
        note: "Cancelled inside the window. Payment returned.",
      }),
    );
  }
  return {
    ok: true,
    refund,
    insideWindow,
    state: {
      ...state,
      receipts,
      appointments: state.appointments.map((item) => (item.id === current.id ? appointment : item)),
    },
  };
}

export function markNoShow(state: BookState, id: string): BookState {
  return {
    ...state,
    appointments: state.appointments.map((appointment) => {
      if (appointment.id !== id || appointment.status !== "booked") return appointment;
      return {
        ...appointment,
        status: "no_show",
        noShowFee: noShowFeeAmount(appointment.price, policyFor(state, appointment.shopId)),
      };
    }),
  };
}

export function markCompleted(state: BookState, id: string): BookState {
  return {
    ...state,
    appointments: state.appointments.map((appointment) =>
      appointment.id === id && appointment.status === "booked" ? { ...appointment, status: "completed" } : appointment,
    ),
  };
}

export function updateService(state: BookState, service: Service): BookState {
  const next: Service = {
    ...service,
    name: service.name.trim().slice(0, 80) || "Service",
    blurb: service.blurb.trim().slice(0, 180),
    price: cents(Math.min(2000, Math.max(0, service.price))),
    durationMin: Math.min(480, Math.max(5, Math.round(service.durationMin))),
    bufferBeforeMin: Math.min(120, Math.max(0, Math.round(service.bufferBeforeMin))),
    bufferAfterMin: Math.min(120, Math.max(0, Math.round(service.bufferAfterMin))),
    staffIds: service.staffIds.filter((id) => state.staff.some((member) => member.id === id && member.shopId === service.shopId)),
  };
  const exists = state.services.some((item) => item.id === next.id);
  return {
    ...state,
    services: exists ? state.services.map((item) => (item.id === next.id ? next : item)) : [...state.services, next],
  };
}

export function updateStaffHours(state: BookState, staffId: string, weekly: DayHours[]): BookState {
  const weeklyNext = Array.from({ length: 7 }, (_, index) => {
    const day = weekly[index];
    if (!day) return null;
    const openMin = Math.min(23 * 60 + 45, Math.max(0, Math.round(day.openMin)));
    const closeMin = Math.min(24 * 60, Math.max(openMin + 15, Math.round(day.closeMin)));
    return { openMin, closeMin };
  });
  return {
    ...state,
    staff: state.staff.map((member) => (member.id === staffId ? { ...member, weekly: weeklyNext } : member)),
  };
}

export function addBlock(state: BookState, block: Block): { ok: true; state: BookState } | { ok: false; error: string } {
  const start = new Date(block.startIso).getTime();
  const end = new Date(block.endIso).getTime();
  if (!staffById(state, block.staffId)) return { ok: false, error: "Pick a person to block." };
  if (!(end > start)) return { ok: false, error: "The block needs a later end time." };
  if (end - start > 14 * 60 * 60 * 1000) return { ok: false, error: "Block one stretch at a time, up to 14 hours." };
  return { ok: true, state: { ...state, blocks: [...state.blocks, { ...block, reason: block.reason.trim().slice(0, 80) || "Blocked" }] } };
}

export function removeBlock(state: BookState, id: string): BookState {
  return { ...state, blocks: state.blocks.filter((block) => block.id !== id) };
}

export function updatePolicy(state: BookState, shopId: string, policy: Policy): BookState {
  return { ...state, policies: { ...state.policies, [shopId]: sanitizePolicy(policy) } };
}

export function updateClientNote(state: BookState, clientId: string, note: string): BookState {
  return {
    ...state,
    clients: state.clients.map((client) =>
      client.id === clientId ? { ...client, note: note.slice(0, 280) } : client,
    ),
  };
}

export function appointmentByToken(state: BookState, token: string) {
  return state.appointments.find((appointment) => appointment.token === token);
}

export function receiptsFor(state: BookState, appointmentId: string): Receipt[] {
  return state.receipts.filter((receipt) => receipt.appointmentId === appointmentId);
}
