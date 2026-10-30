import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chargeWithProvider, refundWithProvider } from "./live-pay.ts";
import { verifyOwner } from "./owner-auth.ts";

describe("live card charges", () => {
  it("refuses a raw card number before calling the processor", async () => {
    let called = false;
    const fetchImpl: typeof fetch = async () => {
      called = true;
      return new Response("{}", { status: 200 });
    };
    const result = await chargeWithProvider(
      {
        provider: "stripe",
        amountCents: 2304,
        source: "4242424242424242",
        idempotencyKey: "idem",
      },
      { stripeSecret: "sk_test_example" },
      fetchImpl,
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /raw card/);
    assert.equal(called, false);
  });

  it("sends a token to Stripe and never the card number", async () => {
    let body = "";
    const fetchImpl: typeof fetch = async (_url, init) => {
      body = String(init?.body ?? "");
      return new Response(JSON.stringify({ id: "pi_test_123", status: "succeeded" }), { status: 200 });
    };
    const result = await chargeWithProvider(
      { provider: "stripe", amountCents: 2304, source: "pm_card_visa", idempotencyKey: "idem-1" },
      { stripeSecret: "sk_test_example" },
      fetchImpl,
    );
    assert.deepEqual(result, { ok: true, reference: "pi_test_123", provider: "stripe" });
    assert.match(body, /pm_card_visa/);
    assert.equal(body.includes("4242"), false);
  });

  it("refunds a Square payment by id", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ refund: { id: "re_sq_1" } }), { status: 200 });
    const result = await refundWithProvider(
      { provider: "square", reference: "pay_1", amountCents: 2304, idempotencyKey: "idem-r" },
      { squareAccessToken: "sq_token", squareApplicationId: "sandbox-app" },
      fetchImpl,
    );
    assert.deepEqual(result, { ok: true, reference: "re_sq_1", provider: "square" });
  });
});

describe("owner sign-in", () => {
  it("accepts the configured owner and rejects everyone else", () => {
    const creds = { ownerEmail: "owner@shop.test", ownerPassword: "correct-horse", ownerName: "Avery Brooks" };
    assert.deepEqual(verifyOwner({ email: "owner@shop.test", password: "correct-horse", ...creds }), {
      ok: true,
      email: "owner@shop.test",
      name: "Avery Brooks",
    });
    const wrong = verifyOwner({ email: "owner@shop.test", password: "nope", ...creds });
    assert.equal(wrong.ok, false);
    const missing = verifyOwner({ email: "owner@shop.test", password: "correct-horse" });
    assert.equal(missing.ok, false);
    if (missing.ok) return;
    assert.match(missing.error, /not configured/);
  });
});
