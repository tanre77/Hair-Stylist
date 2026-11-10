import { createServerFn } from "@tanstack/react-start";
import type { LiveCreds } from "./live-pay";
import {
  authorizeCardCharge,
  authorizeCardRefund,
  authorizeOwnerSignIn,
  ownerSessionSecret,
  paymentTicketSecret,
  type ChargeRequest,
  type OwnerRequest,
  type RefundRequest,
} from "./payment-guard";

function processorCreds(): LiveCreds {
  return {
    stripeSecret: process.env.STRIPE_SECRET_KEY,
    squareAccessToken: process.env.SQUARE_ACCESS_TOKEN,
    squareLocationId: process.env.SQUARE_LOCATION_ID || process.env.VITE_SQUARE_LOCATION_ID,
    squareApplicationId: process.env.SQUARE_APPLICATION_ID || process.env.VITE_SQUARE_APPLICATION_ID,
  };
}

export const chargeCardPayment = createServerFn({ method: "POST" })
  .validator((data: ChargeRequest) => data)
  .handler(async ({ data }) => {
    return authorizeCardCharge(data, {
      now: new Date(),
      ticketSecret: paymentTicketSecret(process.env),
      creds: processorCreds(),
    });
  });

export const refundCardPayment = createServerFn({ method: "POST" })
  .validator((data: RefundRequest) => data)
  .handler(async ({ data }) => {
    return authorizeCardRefund(data, {
      now: new Date(),
      ticketSecret: paymentTicketSecret(process.env),
      sessionSecret: ownerSessionSecret(process.env),
      ownerEmail: process.env.OWNER_EMAIL,
      creds: processorCreds(),
    });
  });

export const signInOwner = createServerFn({ method: "POST" })
  .validator((data: OwnerRequest) => data)
  .handler(async ({ data }) => {
    return authorizeOwnerSignIn(data, {
      now: new Date(),
      ownerEmail: process.env.OWNER_EMAIL,
      ownerPassword: process.env.OWNER_PASSWORD,
      ownerName: process.env.OWNER_NAME,
      sessionSecret: ownerSessionSecret(process.env),
    });
  });
