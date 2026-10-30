import { rejectRawCard } from "./card-pay.ts";

export type LiveChargeInput = {
  provider: "stripe" | "square";
  amountCents: number;
  source: string;
  idempotencyKey: string;
};

export type LiveCreds = {
  stripeSecret?: string;
  squareAccessToken?: string;
  squareLocationId?: string;
  squareApplicationId?: string;
  squareHost?: string;
};

export type LiveResult =
  | { ok: true; reference: string; provider: "stripe" | "square" }
  | { ok: false; error: string };

function formBody(fields: Record<string, string>): string {
  return new URLSearchParams(fields).toString();
}

export function squareApiHost(applicationId: string | undefined, override?: string): string {
  if (override) return override.replace(/\/$/, "");
  if (applicationId?.startsWith("sandbox")) return "https://connect.squareupsandbox.com";
  return "https://connect.squareup.com";
}

export async function chargeWithProvider(
  input: LiveChargeInput,
  creds: LiveCreds,
  fetchImpl: typeof fetch = fetch,
): Promise<LiveResult> {
  const refused = rejectRawCard(input.source);
  if (refused) return { ok: false, error: refused };
  if (!Number.isInteger(input.amountCents) || input.amountCents < 50 || input.amountCents > 500_000) {
    return { ok: false, error: "Amount is out of range." };
  }
  if (input.provider === "stripe") {
    if (!creds.stripeSecret) return { ok: false, error: "Card payments are not configured." };
    const response = await fetchImpl("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: formBody({
        amount: String(input.amountCents),
        currency: "usd",
        payment_method: input.source,
        confirm: "true",
        "payment_method_types[]": "card",
      }),
    });
    const json = (await response.json()) as { id?: string; error?: { message?: string }; status?: string };
    if (!response.ok || !json.id) {
      return { ok: false, error: json.error?.message || "The card was declined." };
    }
    if (json.status && json.status !== "succeeded" && json.status !== "requires_capture") {
      return { ok: false, error: "The card needs another step we couldn't finish." };
    }
    return { ok: true, reference: json.id, provider: "stripe" };
  }
  if (!creds.squareAccessToken || !creds.squareLocationId) {
    return { ok: false, error: "Card payments are not configured." };
  }
  const host = squareApiHost(creds.squareApplicationId, creds.squareHost);
  const response = await fetchImpl(`${host}/v2/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.squareAccessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-12-18",
    },
    body: JSON.stringify({
      source_id: input.source,
      idempotency_key: input.idempotencyKey,
      amount_money: { amount: input.amountCents, currency: "USD" },
      location_id: creds.squareLocationId,
    }),
  });
  const json = (await response.json()) as {
    payment?: { id?: string; status?: string };
    errors?: Array<{ detail?: string }>;
  };
  if (!response.ok || !json.payment?.id) {
    return { ok: false, error: json.errors?.[0]?.detail || "The card was declined." };
  }
  return { ok: true, reference: json.payment.id, provider: "square" };
}

export async function refundWithProvider(
  input: { provider: "stripe" | "square"; reference: string; amountCents: number; idempotencyKey: string },
  creds: LiveCreds,
  fetchImpl: typeof fetch = fetch,
): Promise<LiveResult> {
  if (rejectRawCard(input.reference)) return { ok: false, error: "Refusing raw card numbers." };
  if (!Number.isInteger(input.amountCents) || input.amountCents < 1) {
    return { ok: false, error: "Refund amount is out of range." };
  }
  if (input.provider === "stripe") {
    if (!creds.stripeSecret) return { ok: false, error: "Refunds are not configured." };
    const response = await fetchImpl("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: formBody({
        payment_intent: input.reference,
        amount: String(input.amountCents),
      }),
    });
    const json = (await response.json()) as { id?: string; error?: { message?: string } };
    if (!response.ok || !json.id) return { ok: false, error: json.error?.message || "The refund failed." };
    return { ok: true, reference: json.id, provider: "stripe" };
  }
  if (!creds.squareAccessToken) return { ok: false, error: "Refunds are not configured." };
  const host = squareApiHost(creds.squareApplicationId, creds.squareHost);
  const response = await fetchImpl(`${host}/v2/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.squareAccessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-12-18",
    },
    body: JSON.stringify({
      payment_id: input.reference,
      idempotency_key: input.idempotencyKey,
      amount_money: { amount: input.amountCents, currency: "USD" },
    }),
  });
  const json = (await response.json()) as { refund?: { id?: string }; errors?: Array<{ detail?: string }> };
  if (!response.ok || !json.refund?.id) {
    return { ok: false, error: json.errors?.[0]?.detail || "The refund failed." };
  }
  return { ok: true, reference: json.refund.id, provider: "square" };
}
