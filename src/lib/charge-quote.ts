import type { Policy } from "./book-types.ts";
import { quoteVisit } from "./checkout.ts";
import { cents } from "./money.ts";
import { sanitizePolicy } from "./policies.ts";
import { createSeed } from "./seed.ts";

/** Same ceiling as `bookAppointment`: a tip above $500 is refused. */
export const MAX_TIP_CENTS = 50_000;

export const CHARGE_MIN_CENTS = 50;
export const CHARGE_MAX_CENTS = 500_000;

const START_SKEW_MS = 2 * 60 * 1000;
const START_HORIZON_MS = 400 * 24 * 60 * 60 * 1000;

type Menu = {
  services: Array<{ id: string; shopId: string; price: number }>;
  policies: Record<string, Policy>;
  shopIds: Set<string>;
};

let menuCache: Menu | null = null;

function publishedMenu(): Menu {
  if (!menuCache) {
    const book = createSeed(new Date(0));
    menuCache = {
      services: book.services.map((service) => ({
        id: service.id,
        shopId: service.shopId,
        price: service.price,
      })),
      policies: book.policies,
      shopIds: new Set(book.shops.map((shop) => shop.id)),
    };
  }
  return menuCache;
}

export function publishedPrice(shopId: string, serviceId: string): number | null {
  const service = publishedMenu().services.find((item) => item.id === serviceId && item.shopId === shopId);
  return service ? service.price : null;
}

export function publishedPolicy(shopId: string): Policy | null {
  const menu = publishedMenu();
  if (!menu.shopIds.has(shopId)) return null;
  return sanitizePolicy(menu.policies[shopId] ?? {});
}

export function toCents(dollars: number): number {
  if (!Number.isFinite(dollars)) return 0;
  return Math.round(cents(dollars) * 100);
}

export type VisitCharge = {
  ok: true;
  amountCents: number;
  tipCents: number;
  serviceDueCents: number;
  policy: Policy;
  payChoice: "deposit" | "full";
};

export function computeVisitCharge(input: {
  shopId: string;
  serviceId: string;
  payChoice: "deposit" | "full";
  tipCents: number;
}): VisitCharge | { ok: false; error: string } {
  if (!Number.isInteger(input.tipCents) || input.tipCents < 0 || input.tipCents > MAX_TIP_CENTS) {
    return { ok: false, error: "Tip is out of range." };
  }
  const price = publishedPrice(input.shopId, input.serviceId);
  const policy = publishedPolicy(input.shopId);
  if (price === null || !policy) return { ok: false, error: "That service isn't on the menu." };
  const priced = quoteVisit({
    price,
    policy,
    choice: input.payChoice,
    tip: input.tipCents / 100,
  });
  const amountCents = toCents(priced.dueToday);
  if (amountCents < CHARGE_MIN_CENTS || amountCents > CHARGE_MAX_CENTS) {
    return { ok: false, error: "Amount is out of range." };
  }
  return {
    ok: true,
    amountCents,
    tipCents: toCents(priced.tip),
    serviceDueCents: toCents(priced.serviceDue),
    policy,
    payChoice: priced.choice,
  };
}

export function visitStartError(startIso: string, now: Date): string | null {
  const start = Date.parse(startIso);
  if (!Number.isFinite(start)) return "Pick a time on the book.";
  if (start < now.getTime() - START_SKEW_MS) return "Pick a time that hasn't passed.";
  if (start > now.getTime() + START_HORIZON_MS) return "That time is too far out.";
  return null;
}
