import { createServerFn } from "@tanstack/react-start";
import { chargeWithProvider, refundWithProvider } from "./live-pay";
import { rejectRawCard } from "./card-pay";
import { verifyOwner } from "./owner-auth";

export type ChargePayload = {
  provider: "stripe" | "square";
  amountCents: number;
  source: string;
  idempotencyKey: string;
};

export type RefundPayload = {
  provider: "stripe" | "square";
  reference: string;
  amountCents: number;
  idempotencyKey: string;
};

export type OwnerPayload = {
  email: string;
  password: string;
};

export const chargeCardPayment = createServerFn({ method: "POST" })
  .validator((data: ChargePayload) => data)
  .handler(async ({ data }) => {
    const refused = rejectRawCard(data.source);
    if (refused) return { ok: false as const, error: refused };
    return chargeWithProvider(
      {
        provider: data.provider,
        amountCents: data.amountCents,
        source: data.source,
        idempotencyKey: data.idempotencyKey,
      },
      {
        stripeSecret: process.env.STRIPE_SECRET_KEY,
        squareAccessToken: process.env.SQUARE_ACCESS_TOKEN,
        squareLocationId: process.env.SQUARE_LOCATION_ID || process.env.VITE_SQUARE_LOCATION_ID,
        squareApplicationId: process.env.SQUARE_APPLICATION_ID || process.env.VITE_SQUARE_APPLICATION_ID,
      },
    );
  });

export const refundCardPayment = createServerFn({ method: "POST" })
  .validator((data: RefundPayload) => data)
  .handler(async ({ data }) => {
    if (rejectRawCard(data.reference)) return { ok: false as const, error: "Refusing raw card numbers." };
    return refundWithProvider(
      {
        provider: data.provider,
        reference: data.reference,
        amountCents: data.amountCents,
        idempotencyKey: data.idempotencyKey,
      },
      {
        stripeSecret: process.env.STRIPE_SECRET_KEY,
        squareAccessToken: process.env.SQUARE_ACCESS_TOKEN,
        squareApplicationId: process.env.SQUARE_APPLICATION_ID || process.env.VITE_SQUARE_APPLICATION_ID,
      },
    );
  });

export const signInOwner = createServerFn({ method: "POST" })
  .validator((data: OwnerPayload) => data)
  .handler(async ({ data }) => {
    return verifyOwner({
      email: data.email,
      password: data.password,
      ownerEmail: process.env.OWNER_EMAIL,
      ownerPassword: process.env.OWNER_PASSWORD,
      ownerName: process.env.OWNER_NAME,
    });
  });
