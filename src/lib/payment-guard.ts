import { z } from "zod";
import type { Policy } from "./book-types.ts";
import {
  CHARGE_MAX_CENTS,
  CHARGE_MIN_CENTS,
  computeVisitCharge,
  visitStartError,
} from "./charge-quote.ts";
import { chargeWithProvider, refundWithProvider, type LiveCreds } from "./live-pay.ts";
import { verifyOwner } from "./owner-auth.ts";
import { insideCancellationWindow, sanitizePolicy } from "./policies.ts";
import { openJson, sha256Hex, signJson, timingSafeEqualString } from "./signed-token.ts";

const idSchema = z.string().min(8).max(80).regex(/^[A-Za-z0-9_-]+$/);
const secretSchema = z.string().min(20).max(8_000);

export const chargeRequestSchema = z.object({
  provider: z.enum(["stripe", "square"]),
  shopId: z.string().min(1).max(64),
  serviceId: z.string().min(1).max(64),
  payChoice: z.enum(["deposit", "full"]),
  tipCents: z.number().int().min(-1_000_000).max(10_000_000),
  amountCents: z.number().int().min(0).max(10_000_000),
  source: z.string().trim().min(1).max(512),
  idempotencyKey: z.string().min(8).max(255),
  bookingId: idSchema,
  manageToken: idSchema,
  startIso: z.iso.datetime(),
});

export const refundRequestSchema = z.object({
  provider: z.enum(["stripe", "square"]),
  reference: z.string().trim().min(1).max(128),
  amountCents: z.number().int().min(0).max(10_000_000),
  idempotencyKey: z.string().min(8).max(255),
  ticket: secretSchema,
  manageToken: idSchema.optional(),
  ownerToken: secretSchema.optional(),
});

export const ownerRequestSchema = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200),
});

export type ChargeRequest = z.infer<typeof chargeRequestSchema>;
export type RefundRequest = z.infer<typeof refundRequestSchema>;
export type OwnerRequest = z.infer<typeof ownerRequestSchema>;

const OWNER_SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const DETAILS = "Check the payment details.";

export type ChargeTicket = {
  bookingId: string;
  manageTokenHash: string;
  shopId: string;
  serviceId: string;
  startIso: string;
  amountCents: number;
  provider: "stripe" | "square";
  reference: string;
  policy: Policy;
};

export function paymentTicketSecret(env: {
  PAYMENT_TICKET_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  SQUARE_ACCESS_TOKEN?: string;
}): string {
  return env.PAYMENT_TICKET_SECRET?.trim() || env.STRIPE_SECRET_KEY?.trim() || env.SQUARE_ACCESS_TOKEN?.trim() || "";
}

export function ownerSessionSecret(env: { OWNER_SESSION_SECRET?: string; OWNER_PASSWORD?: string }): string {
  const dedicated = env.OWNER_SESSION_SECRET?.trim();
  if (dedicated) return dedicated;
  const password = env.OWNER_PASSWORD ?? "";
  if (!password) return "";
  return `bands-owner-session-v1:${password}`;
}

function invalidDetails(): { ok: false; error: string } {
  return { ok: false, error: DETAILS };
}

function readPolicy(value: unknown): Policy | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (typeof row.refundInsideWindow !== "boolean" || typeof row.allowDeposit !== "boolean") return null;
  if (
    !Number.isInteger(row.cancellationWindowHours) ||
    !Number.isInteger(row.noShowFeePercent) ||
    !Number.isInteger(row.depositPercent)
  ) {
    return null;
  }
  const policy = sanitizePolicy({
    cancellationWindowHours: row.cancellationWindowHours as number,
    refundInsideWindow: row.refundInsideWindow,
    noShowFeePercent: row.noShowFeePercent as number,
    depositPercent: row.depositPercent as number,
    allowDeposit: row.allowDeposit,
  });
  if (
    policy.cancellationWindowHours !== row.cancellationWindowHours ||
    policy.noShowFeePercent !== row.noShowFeePercent ||
    policy.depositPercent !== row.depositPercent
  ) {
    return null;
  }
  return policy;
}

export async function readChargeTicket(token: string, secret: string, now: Date): Promise<ChargeTicket | null> {
  const row = await openJson(token, secret, now);
  if (!row || row.kind !== "charge") return null;
  if (row.provider !== "stripe" && row.provider !== "square") return null;
  if (
    typeof row.bookingId !== "string" ||
    typeof row.manageTokenHash !== "string" ||
    typeof row.shopId !== "string" ||
    typeof row.serviceId !== "string" ||
    typeof row.startIso !== "string" ||
    typeof row.reference !== "string"
  ) {
    return null;
  }
  if (!Number.isInteger(row.amountCents) || (row.amountCents as number) < CHARGE_MIN_CENTS) return null;
  if ((row.amountCents as number) > CHARGE_MAX_CENTS) return null;
  const policy = readPolicy(row.policy);
  if (!policy) return null;
  return {
    bookingId: row.bookingId,
    manageTokenHash: row.manageTokenHash,
    shopId: row.shopId,
    serviceId: row.serviceId,
    startIso: row.startIso,
    amountCents: row.amountCents as number,
    provider: row.provider,
    reference: row.reference,
    policy,
  };
}

export async function readOwnerSession(
  token: string,
  secret: string,
  now: Date,
): Promise<{ email: string; name: string } | null> {
  const row = await openJson(token, secret, now);
  if (!row || row.kind !== "owner") return null;
  if (typeof row.email !== "string" || typeof row.name !== "string" || !row.email || !row.name) return null;
  return { email: row.email, name: row.name };
}

async function signChargeTicket(input: {
  secret: string;
  now: Date;
  startIso: string;
  claims: Omit<ChargeTicket, "reference"> & { reference: string };
}): Promise<string> {
  const start = Date.parse(input.startIso);
  const exp = Math.floor((start + 48 * 60 * 60 * 1000) / 1000);
  return signJson(input.secret, {
    kind: "charge",
    exp,
    bookingId: input.claims.bookingId,
    manageTokenHash: input.claims.manageTokenHash,
    shopId: input.claims.shopId,
    serviceId: input.claims.serviceId,
    startIso: input.claims.startIso,
    amountCents: input.claims.amountCents,
    provider: input.claims.provider,
    reference: input.claims.reference,
    policy: input.claims.policy,
  });
}

export async function authorizeCardCharge(
  raw: unknown,
  deps: { now: Date; ticketSecret: string; creds: LiveCreds; fetchImpl?: typeof fetch },
): Promise<
  | { ok: true; reference: string; provider: "stripe" | "square"; amountCents: number; ticket: string }
  | { ok: false; error: string }
> {
  const parsed = chargeRequestSchema.safeParse(raw);
  if (!parsed.success) return invalidDetails();
  const input = parsed.data;
  const startError = visitStartError(input.startIso, deps.now);
  if (startError) return { ok: false, error: startError };
  const priced = computeVisitCharge(input);
  if (!priced.ok) return priced;
  if (input.amountCents !== priced.amountCents || input.tipCents !== priced.tipCents) {
    return { ok: false, error: "The amount doesn't match this visit." };
  }
  if (!deps.ticketSecret) return { ok: false, error: "Card payments are not configured." };
  const charged = await chargeWithProvider(
    {
      provider: input.provider,
      amountCents: priced.amountCents,
      source: input.source,
      idempotencyKey: input.idempotencyKey,
    },
    deps.creds,
    deps.fetchImpl,
  );
  if (!charged.ok) return charged;
  const ticket = await signChargeTicket({
    secret: deps.ticketSecret,
    now: deps.now,
    startIso: input.startIso,
    claims: {
      bookingId: input.bookingId,
      manageTokenHash: await sha256Hex(input.manageToken),
      shopId: input.shopId,
      serviceId: input.serviceId,
      startIso: input.startIso,
      amountCents: priced.amountCents,
      provider: charged.provider,
      reference: charged.reference,
      policy: priced.policy,
    },
  });
  return { ok: true, reference: charged.reference, provider: charged.provider, amountCents: priced.amountCents, ticket };
}

export async function authorizeCardRefund(
  raw: unknown,
  deps: {
    now: Date;
    ticketSecret: string;
    sessionSecret: string;
    ownerEmail?: string;
    creds: LiveCreds;
    fetchImpl?: typeof fetch;
  },
): Promise<{ ok: true; reference: string; provider: "stripe" | "square"; amountCents: number } | { ok: false; error: string }> {
  const parsed = refundRequestSchema.safeParse(raw);
  if (!parsed.success) return invalidDetails();
  const input = parsed.data;
  const ticket = await readChargeTicket(input.ticket, deps.ticketSecret, deps.now);
  if (!ticket) return { ok: false, error: "The payment record is not valid." };
  if (ticket.provider !== input.provider || ticket.reference !== input.reference) {
    return { ok: false, error: "That refund doesn't match the visit." };
  }
  const guestOk = input.manageToken
    ? timingSafeEqualString(await sha256Hex(input.manageToken), ticket.manageTokenHash)
    : false;
  const session = input.ownerToken ? await readOwnerSession(input.ownerToken, deps.sessionSecret, deps.now) : null;
  const expectedOwner = deps.ownerEmail?.trim().toLowerCase() ?? "";
  const ownerOk = Boolean(session && expectedOwner && timingSafeEqualString(session.email.toLowerCase(), expectedOwner));
  if (!guestOk && !ownerOk) return { ok: false, error: "Refunds need the visit link or an owner session." };
  if (input.amountCents > ticket.amountCents) return { ok: false, error: "Refund is larger than the amount paid." };
  if (!ticket.policy.refundInsideWindow || !insideCancellationWindow(ticket.startIso, deps.now, ticket.policy.cancellationWindowHours)) {
    return { ok: false, error: "That visit is outside the cancellation window." };
  }
  if (input.amountCents !== ticket.amountCents) {
    return { ok: false, error: "The refund doesn't match what this visit can return." };
  }
  const refunded = await refundWithProvider(
    {
      provider: input.provider,
      reference: input.reference,
      amountCents: ticket.amountCents,
      idempotencyKey: input.idempotencyKey,
    },
    deps.creds,
    deps.fetchImpl,
  );
  if (!refunded.ok) return refunded;
  return { ok: true, reference: refunded.reference, provider: refunded.provider, amountCents: ticket.amountCents };
}

export async function authorizeOwnerSignIn(
  raw: unknown,
  deps: {
    now: Date;
    ownerEmail?: string;
    ownerPassword?: string;
    ownerName?: string;
    sessionSecret: string;
  },
): Promise<{ ok: true; email: string; name: string; token: string } | { ok: false; error: string }> {
  const parsed = ownerRequestSchema.safeParse(raw);
  if (!parsed.success) return invalidDetails();
  const checked = verifyOwner({
    email: parsed.data.email,
    password: parsed.data.password,
    ownerEmail: deps.ownerEmail,
    ownerPassword: deps.ownerPassword,
    ownerName: deps.ownerName,
  });
  if (!checked.ok) return checked;
  if (!deps.sessionSecret) return { ok: false, error: "Owner sign-in is not configured." };
  const token = await signJson(deps.sessionSecret, {
    kind: "owner",
    exp: Math.floor((deps.now.getTime() + OWNER_SESSION_MS) / 1000),
    email: checked.email,
    name: checked.name,
  });
  return { ok: true, email: checked.email, name: checked.name, token };
}
