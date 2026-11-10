import type { Appointment, Block, BookState, Client, DayHours, Policy, Receipt, Service, Shop, Staff } from "./book-types.ts";
import { DEFAULT_POLICY } from "./book-types.ts";
import { atMinutes, startOfDay } from "./time.ts";

function weekly(openDays: number[], openMin: number, closeMin: number): DayHours[] {
  return Array.from({ length: 7 }, (_, day) => (openDays.includes(day) ? { openMin, closeMin } : null));
}

const TUE_SAT_9_6 = weekly([2, 3, 4, 5, 6], 9 * 60, 18 * 60);
const WED_SUN_9_5 = weekly([0, 3, 4, 5, 6], 9 * 60, 17 * 60);
const WED_SUN_9_6 = weekly([0, 3, 4, 5, 6], 9 * 60, 18 * 60);

function nextOpen(now: Date, weekday: number, hour: number, minute: number): Date {
  const start = startOfDay(now);
  for (let i = 0; i < 21; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    if (day.getDay() !== weekday) continue;
    const at = atMinutes(day, hour * 60 + minute);
    if (at.getTime() > now.getTime()) return at;
  }
  return atMinutes(start, hour * 60 + minute);
}

const POLICY: Policy = { ...DEFAULT_POLICY };

export function createSeed(now: Date): BookState {
  const shops: Shop[] = [
    {
      id: "brooks",
      name: "Brooks & Co.",
      kind: "barbershop",
      neighborhood: "Powell",
      address: "15 E Olentangy St, Powell",
      lat: 40.1566,
      lng: -83.0719,
      rating: 4.8,
      reviews: 312,
      venmo: "Bands-Brooks",
      blurb: "Skin fades, beard lines, and a shop that runs on the book instead of a walk-in pile.",
      image: "/portraits/andre.jpg",
    },
    {
      id: "atelier",
      name: "Atelier North",
      kind: "salon",
      neighborhood: "Powell",
      address: "48 N Liberty St, Powell",
      lat: 40.1591,
      lng: -83.0746,
      rating: 4.9,
      reviews: 186,
      venmo: "Bands-Atelier",
      blurb: "Cuts with time left in them. Color that still looks like your hair on a Wednesday.",
      image: "/portraits/maya.jpg",
    },
    {
      id: "crown",
      name: "Crown & Coil",
      kind: "salon",
      neighborhood: "Short North",
      address: "1281 N High St, Columbus",
      lat: 39.9904,
      lng: -83.0064,
      rating: 4.9,
      reviews: 267,
      venmo: "Bands-Crown",
      blurb: "Silk presses, trims, and color in daylight. The chair is booked, not squeezed.",
      image: "/portraits/nia.jpg",
    },
  ];

  const staff: Staff[] = [
    {
      id: "andre",
      shopId: "brooks",
      name: "Andre Brooks",
      role: "Barber",
      portrait: "/portraits/andre.jpg",
      bio: "Skin fades and a straight razor for the people who want it.",
      weekly: TUE_SAT_9_6,
    },
    {
      id: "jonah",
      shopId: "brooks",
      name: "Jonah Hale",
      role: "Barber",
      portrait: "/portraits/jonah.jpg",
      bio: "Classic scissor cuts. He will say so if the fade you saved is a bad idea.",
      weekly: WED_SUN_9_5,
    },
    {
      id: "malik",
      shopId: "brooks",
      name: "Malik Trent",
      role: "Barber",
      portrait: "/portraits/malik.jpg",
      bio: "Burst fades and clean lineups. He leaves time to fix a patchy beard.",
      weekly: TUE_SAT_9_6,
    },
    {
      id: "maya",
      shopId: "atelier",
      name: "Maya Chen",
      role: "Stylist",
      portrait: "/portraits/maya.jpg",
      bio: "Quiet cuts with a sharp finish, booked long enough to still look right later.",
      weekly: TUE_SAT_9_6,
    },
    {
      id: "priya",
      shopId: "atelier",
      name: "Priya Shah",
      role: "Stylist",
      portrait: "/portraits/priya.jpg",
      bio: "Precision cutting before a talk, a wedding, or a haircut you don't want to think about.",
      weekly: TUE_SAT_9_6,
    },
    {
      id: "camille",
      shopId: "atelier",
      name: "Camille Ortiz",
      role: "Stylist",
      portrait: "/portraits/camille.jpg",
      bio: "Soft finish and bridal trials. The calendar stays small on purpose.",
      weekly: TUE_SAT_9_6,
    },
    {
      id: "nia",
      shopId: "crown",
      name: "Nia Cole",
      role: "Stylist",
      portrait: "/portraits/nia.jpg",
      bio: "Silk presses and twist-outs. She will not heat-style hair that isn't ready.",
      weekly: WED_SUN_9_6,
    },
    {
      id: "lucia",
      shopId: "crown",
      name: "Lucia Reyes",
      role: "Colorist",
      portrait: "/portraits/lucia.jpg",
      bio: "Lived-in color. She photographs your hair in daylight before she mixes anything.",
      weekly: TUE_SAT_9_6,
    },
  ];

  const services: Service[] = [
    { id: "fade", shopId: "brooks", name: "Skin fade", blurb: "Low, mid, or high. Includes a lineup.", price: 38, durationMin: 45, bufferBeforeMin: 0, bufferAfterMin: 15, staffIds: ["andre", "jonah", "malik"] },
    { id: "cut-beard", shopId: "brooks", name: "Cut & beard", blurb: "Haircut plus a shaped beard.", price: 52, durationMin: 60, bufferBeforeMin: 0, bufferAfterMin: 15, staffIds: ["andre", "jonah", "malik"] },
    { id: "shave", shopId: "brooks", name: "Hot towel shave", blurb: "Steam, straight razor, cool towel.", price: 44, durationMin: 40, bufferBeforeMin: 10, bufferAfterMin: 10, staffIds: ["andre", "jonah"] },
    { id: "kids", shopId: "brooks", name: "Kids cut", blurb: "Ages 12 and under.", price: 26, durationMin: 30, bufferBeforeMin: 0, bufferAfterMin: 10, staffIds: ["andre", "malik"] },
    { id: "beard", shopId: "brooks", name: "Beard detail", blurb: "Cheeks, neck, and a tight outline.", price: 18, durationMin: 20, bufferBeforeMin: 0, bufferAfterMin: 10, staffIds: ["jonah", "malik"] },
    { id: "cut-style", shopId: "atelier", name: "Cut & style", blurb: "Consult, cut, and a finish you can redo.", price: 72, durationMin: 75, bufferBeforeMin: 10, bufferAfterMin: 15, staffIds: ["maya", "priya"] },
    { id: "blowout", shopId: "atelier", name: "Blowout", blurb: "Smooth, with movement.", price: 48, durationMin: 45, bufferBeforeMin: 5, bufferAfterMin: 10, staffIds: ["maya", "priya", "camille"] },
    { id: "gloss-cut", shopId: "atelier", name: "Gloss & cut", blurb: "Tone refresh plus a trim.", price: 128, durationMin: 90, bufferBeforeMin: 15, bufferAfterMin: 15, staffIds: ["maya"] },
    { id: "event", shopId: "atelier", name: "Event style", blurb: "Up or down, set to last the night.", price: 95, durationMin: 75, bufferBeforeMin: 10, bufferAfterMin: 15, staffIds: ["priya", "camille"] },
    { id: "bridal", shopId: "atelier", name: "Bridal trial", blurb: "One look, photographed, notes after.", price: 120, durationMin: 90, bufferBeforeMin: 15, bufferAfterMin: 15, staffIds: ["camille"] },
    { id: "silk", shopId: "crown", name: "Silk press", blurb: "Cleanse, treat, then press.", price: 88, durationMin: 90, bufferBeforeMin: 10, bufferAfterMin: 15, staffIds: ["nia"] },
    { id: "trim", shopId: "crown", name: "Trim & shape", blurb: "Dusting or a real cut.", price: 64, durationMin: 60, bufferBeforeMin: 5, bufferAfterMin: 10, staffIds: ["nia"] },
    { id: "twist", shopId: "crown", name: "Twist-out", blurb: "Set, dry, and separate.", price: 72, durationMin: 75, bufferBeforeMin: 10, bufferAfterMin: 10, staffIds: ["nia"] },
    { id: "balayage", shopId: "crown", name: "Balayage", blurb: "Hand-painted, toned, and cut in.", price: 220, durationMin: 180, bufferBeforeMin: 15, bufferAfterMin: 20, staffIds: ["lucia"] },
    { id: "roots", shopId: "crown", name: "Root retouch", blurb: "Regrowth only, matched to your formula.", price: 140, durationMin: 120, bufferBeforeMin: 10, bufferAfterMin: 15, staffIds: ["lucia"] },
    { id: "gloss", shopId: "crown", name: "Gloss", blurb: "Shine and tone. No lift.", price: 65, durationMin: 50, bufferBeforeMin: 5, bufferAfterMin: 10, staffIds: ["lucia"] },
  ];

  const clients: Client[] = [
    { id: "elena", shopId: "brooks", name: "Elena Park", email: "elena@example.com", phone: "614-555-0142", note: "Low skin fade. Sensitive neck." },
    { id: "chris", shopId: "brooks", name: "Chris Alvarez", email: "chris@example.com", phone: "614-555-0177", note: "Beard kept short on the cheeks." },
    { id: "hannah", shopId: "atelier", name: "Hannah Shah", email: "hannah@example.com", phone: "614-555-0190", note: "Gloss, not a full color." },
    { id: "imani", shopId: "crown", name: "Imani Reid", email: "imani@example.com", phone: "614-555-0118", note: "Silk press only when the hair is ready." },
    { id: "grace", shopId: "crown", name: "Grace Liu", email: "grace@example.com", phone: "614-555-0164", note: "Balayage formula is in the card." },
  ];

  const andreTue = nextOpen(now, 2, 10, 0);
  const mayaTue = nextOpen(now, 2, 11, 0);
  const niaWed = nextOpen(now, 3, 13, 0);
  const luciaThu = nextOpen(now, 4, 9, 30);
  const jonahFri = nextOpen(now, 5, 15, 0);
  const lunchStart = atMinutes(andreTue, 12 * 60);
  const lunchEnd = atMinutes(andreTue, 13 * 60);

  const appointments: Appointment[] = [
    appt({
      id: "seed-elena",
      token: "seed-elena",
      service: services[0]!,
      staff: staff[0]!,
      shop: shops[0]!,
      client: clients[0]!,
      start: andreTue,
      choice: "full",
      tip: 7,
      now,
      last4: "4242",
      brand: "visa",
      reference: "demo_ch_elena",
    }),
    appt({
      id: "seed-hannah",
      token: "seed-hannah",
      service: services[5]!,
      staff: staff[3]!,
      shop: shops[1]!,
      client: clients[2]!,
      start: mayaTue,
      choice: "deposit",
      tip: 13,
      now,
      last4: "4444",
      brand: "mastercard",
      reference: "demo_ch_hannah",
    }),
    appt({
      id: "seed-imani",
      token: "seed-imani",
      service: services[10]!,
      staff: staff[6]!,
      shop: shops[2]!,
      client: clients[3]!,
      start: niaWed,
      choice: "full",
      tip: 16,
      now,
      last4: "1117",
      brand: "discover",
      reference: "demo_ch_imani",
    }),
    appt({
      id: "seed-grace",
      token: "seed-grace",
      service: services[13]!,
      staff: staff[7]!,
      shop: shops[2]!,
      client: clients[4]!,
      start: luciaThu,
      choice: "deposit",
      tip: 40,
      now,
      last4: "0005",
      brand: "amex",
      reference: "demo_ch_grace",
    }),
    appt({
      id: "seed-chris",
      token: "seed-chris",
      service: services[2]!,
      staff: staff[1]!,
      shop: shops[0]!,
      client: clients[1]!,
      start: jonahFri,
      choice: "full",
      tip: 8,
      now,
      last4: "4242",
      brand: "visa",
      reference: "demo_ch_chris",
    }),
  ];

  const blocks: Block[] = [
    {
      id: "seed-lunch",
      shopId: "brooks",
      staffId: "andre",
      startIso: lunchStart.toISOString(),
      endIso: lunchEnd.toISOString(),
      reason: "Lunch",
    },
  ];

  const receipts: Receipt[] = appointments.map((appointment) => ({
    id: `rcpt-${appointment.id}`,
    appointmentId: appointment.id,
    token: appointment.token,
    kind: "payment" as const,
    at: appointment.createdAt,
    shopName: appointment.shopName,
    serviceName: appointment.serviceName,
    staffName: appointment.staffName,
    clientName: clients.find((client) => client.id === appointment.clientId)?.name ?? "Guest",
    whenIso: appointment.startIso,
    method: appointment.payment.method,
    provider: appointment.payment.provider,
    reference: appointment.payment.reference,
    serviceAmount: Math.round((appointment.dueToday - appointment.tip) * 100) / 100,
    tip: appointment.tip,
    total: appointment.dueToday,
    last4: appointment.payment.last4,
    brand: appointment.payment.brand,
    note: appointment.payChoice === "deposit" ? "Deposit on the demo book." : "Paid in full on the demo book.",
  }));

  return {
    shops,
    staff,
    services,
    clients,
    appointments,
    blocks,
    receipts,
    policies: { brooks: { ...POLICY }, atelier: { ...POLICY }, crown: { ...POLICY, depositPercent: 40 } },
  };
}

function appt(input: {
  id: string;
  token: string;
  service: Service;
  staff: Staff;
  shop: Shop;
  client: Client;
  start: Date;
  choice: "deposit" | "full";
  tip: number;
  now: Date;
  last4: string;
  brand: string;
  reference: string;
}): Appointment {
  const depositRate = input.shop.id === "crown" ? 0.4 : 0.3;
  const serviceDue = input.choice === "deposit" ? Math.round(input.service.price * depositRate * 100) / 100 : input.service.price;
  const dueToday = Math.round((serviceDue + input.tip) * 100) / 100;
  return {
    id: input.id,
    token: input.token,
    shopId: input.shop.id,
    staffId: input.staff.id,
    serviceId: input.service.id,
    clientId: input.client.id,
    serviceName: input.service.name,
    staffName: input.staff.name,
    shopName: input.shop.name,
    startIso: input.start.toISOString(),
    durationMin: input.service.durationMin,
    bufferBeforeMin: input.service.bufferBeforeMin,
    bufferAfterMin: input.service.bufferAfterMin,
    price: input.service.price,
    tip: input.tip,
    payChoice: input.choice,
    dueToday,
    balanceAtVisit: Math.round((input.service.price - serviceDue) * 100) / 100,
    status: "booked",
    payment: {
      method: "card",
      status: "paid",
      provider: "demo",
      reference: input.reference,
      amount: dueToday,
      tip: input.tip,
      last4: input.last4,
      brand: input.brand,
    },
    createdAt: input.now.toISOString(),
  };
}

export function findStaff(state: BookState, id: string) {
  return state.staff.find((member) => member.id === id);
}
