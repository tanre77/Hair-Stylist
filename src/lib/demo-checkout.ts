import type { BookState, Payment } from "./book-types.ts";
import { bookAppointment, policyFor, serviceById, type BookInput, type BookResult } from "./engine.ts";
import { mockCharge, mockWalletPayment, tokenizeCard } from "./card-pay.ts";
import { quoteVisit, tipAmount, type TipPreset } from "./checkout.ts";

export type DemoCheckoutInput = {
  id: string;
  token: string;
  receiptId: string;
  clientId: string;
  shopId: string;
  staffId: string;
  serviceId: string;
  startIso: string;
  client: { name: string; email: string; phone: string };
  payChoice: "deposit" | "full";
  tipPreset: TipPreset;
  customTip: number;
  now: Date;
  method: "card" | "venmo" | "apple";
  card?: { pan: string; exp: string; cvc: string; postal: string };
  chargeReference?: string;
};

export function demoCheckout(state: BookState, input: DemoCheckoutInput): BookResult {
  const service = serviceById(state, input.serviceId);
  if (!service) return { ok: false, error: "That service isn't on the menu." };
  const tip = tipAmount(service.price, input.tipPreset, input.customTip);
  const priced = quoteVisit({
    price: service.price,
    policy: policyFor(state, input.shopId),
    choice: input.payChoice,
    tip,
  });
  let payment: Omit<Payment, "amount" | "tip">;
  if (input.method === "card") {
    if (!input.card) return { ok: false, error: "Add the card." };
    const token = tokenizeCard(input.card, input.now);
    if (!token.ok) return token;
    const charged = mockCharge(token.token, Math.round(priced.dueToday * 100), input.chargeReference);
    payment = {
      method: "card",
      status: charged.status,
      provider: "demo",
      reference: charged.reference,
      last4: charged.last4,
      brand: charged.brand,
    };
  } else {
    const wallet = mockWalletPayment(
      input.method,
      priced.dueToday,
      input.chargeReference ?? `demo_${input.method}_${input.id}`,
    );
    payment = {
      method: wallet.method,
      status: wallet.status,
      provider: "demo",
      reference: wallet.reference,
    };
  }
  const book: BookInput = {
    id: input.id,
    token: input.token,
    receiptId: input.receiptId,
    clientId: input.clientId,
    shopId: input.shopId,
    staffId: input.staffId,
    serviceId: input.serviceId,
    startIso: input.startIso,
    client: input.client,
    payChoice: input.payChoice,
    tip,
    payment,
    now: input.now,
  };
  return bookAppointment(state, book);
}
