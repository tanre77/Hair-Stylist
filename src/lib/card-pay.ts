import type { PayMethod, PayProvider, Payment, Receipt } from "./book-types.ts";

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export type CardToken = {
  token: string;
  brand: CardBrand;
  last4: string;
};

const PAN_IN_TEXT = /\d(?:[ -]*\d){12,18}/;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function luhnOk(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function detectBrand(digits: string): CardBrand {
  if (/^3[47]/.test(digits)) return "amex";
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits) || /^2(?:2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) return "mastercard";
  if (/^6(?:011|5)/.test(digits)) return "discover";
  return "unknown";
}

export function looksLikeRawPan(value: string): boolean {
  const match = value.match(PAN_IN_TEXT);
  if (!match) return false;
  return luhnOk(digitsOnly(match[0]));
}

/** True when any string in the tree contains a full card number. Last-4 is fine. */
export function containsRawPan(value: unknown): boolean {
  if (typeof value === "string") return looksLikeRawPan(value);
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => containsRawPan(item));
  return Object.values(value).some((item) => containsRawPan(item));
}

export function rejectRawCard(source: string): string | null {
  if (looksLikeRawPan(source)) return "Refusing raw card numbers.";
  return null;
}

function expiryOk(month: number, year: number, now: Date): boolean {
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return false;
  const end = new Date(year, month, 0, 23, 59, 59, 999).getTime();
  return end >= now.getTime();
}

export function tokenizeCard(
  input: { pan: string; exp: string; cvc: string; postal: string },
  now = new Date(),
): { ok: true; token: CardToken } | { ok: false; error: string } {
  const pan = digitsOnly(input.pan);
  if (!luhnOk(pan)) return { ok: false, error: "That card number doesn't check out." };
  const expMatch = /^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/.exec(input.exp.trim());
  if (!expMatch) return { ok: false, error: "Use an expiration like 12/28." };
  const month = Number(expMatch[1]);
  const rawYear = Number(expMatch[2]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  if (!expiryOk(month, year, now)) return { ok: false, error: "That card is expired." };
  const cvc = digitsOnly(input.cvc);
  const brand = detectBrand(pan);
  if (brand === "amex" ? cvc.length !== 4 : cvc.length !== 3) {
    return { ok: false, error: brand === "amex" ? "Amex needs a 4-digit code." : "Enter the 3-digit code." };
  }
  const postal = input.postal.trim();
  if (!/^\d{5}(?:-\d{4})?$/.test(postal)) return { ok: false, error: "Enter a 5-digit ZIP code." };
  const last4 = pan.slice(-4);
  const token = `demo_tok_${brand}_${last4}_${month.toString().padStart(2, "0")}${year}`;
  return { ok: true, token: { token, brand, last4 } };
}

export function mockCharge(token: CardToken, amountCents: number, reference?: string): Payment {
  return {
    method: "card",
    status: "paid",
    provider: "demo",
    reference: reference ?? `demo_ch_${token.last4}_${amountCents}`,
    amount: amountCents / 100,
    tip: 0,
    last4: token.last4,
    brand: token.brand,
  };
}

export function mockWalletPayment(method: "venmo" | "apple", amount: number, reference: string): Payment {
  return {
    method,
    status: "paid",
    provider: "demo",
    reference,
    amount,
    tip: 0,
  };
}

export function mockRefund(reference: string): { reference: string; provider: "demo" } {
  return { reference: `demo_re_${reference}`, provider: "demo" };
}

export function paymentFromLive(input: {
  method: PayMethod;
  provider: PayProvider;
  reference: string;
  amount: number;
  tip: number;
  status: Payment["status"];
  last4?: string;
  brand?: string;
}): Payment {
  const payment: Payment = {
    method: input.method,
    provider: input.provider,
    reference: input.reference,
    amount: input.amount,
    tip: input.tip,
    status: input.status,
  };
  if (input.last4) payment.last4 = input.last4;
  if (input.brand) payment.brand = input.brand;
  return payment;
}

export function makeReceipt(input: {
  id: string;
  appointmentId: string;
  token: string;
  kind: Receipt["kind"];
  at: string;
  shopName: string;
  serviceName: string;
  staffName: string;
  clientName: string;
  whenIso: string;
  payment: Payment;
  serviceAmount: number;
  tip: number;
  total: number;
  note: string;
}): Receipt {
  return {
    id: input.id,
    appointmentId: input.appointmentId,
    token: input.token,
    kind: input.kind,
    at: input.at,
    shopName: input.shopName,
    serviceName: input.serviceName,
    staffName: input.staffName,
    clientName: input.clientName,
    whenIso: input.whenIso,
    method: input.payment.method,
    provider: input.payment.provider,
    reference: input.payment.reference,
    serviceAmount: input.serviceAmount,
    tip: input.tip,
    total: input.total,
    last4: input.payment.last4,
    brand: input.payment.brand,
    note: input.note,
  };
}
