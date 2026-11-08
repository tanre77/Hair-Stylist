import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { computeVisitCharge } from "./charge-quote.ts";
import { liveApplePayBlock } from "./payments.ts";
import {
  authorizeCardCharge,
  authorizeCardRefund,
  authorizeOwnerSignIn,
  ownerSessionSecret,
  type ChargeRequest,
} from "./payment-guard.ts";

const now = new Date("2026-06-01T15:00:00.000Z");
const soon = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
const later = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
const ticketSecret = "ticket-secret";
const ownerPassword = "correct-horse";
const sessionSecret = ownerSessionSecret({ OWNER_PASSWORD: ownerPassword });

const creds = { stripeSecret: "sk_test_example" };
const ownerCreds = {
  ownerEmail: "owner@shop.test",
  ownerPassword,
  ownerName: "Avery Brooks",
  sessionSecret,
};

function chargeInput(overrides: Partial<ChargeRequest> = {}): ChargeRequest {
  return {
    provider: "stripe",
    shopId: "atelier",
    serviceId: "blowout",
    payChoice: "deposit",
    tipCents: 864,
    amountCents: 2304,
    source: "pm_card_visa",
    idempotencyKey: "idem-charge-1",
    bookingId: "apt_test_blowout",
    manageToken: "manage-token-123",
    startIso: later,
    ...overrides,
  };
}

function stripeFetch(capture: { called: number; body: string }): typeof fetch {
  return async (_url, init) => {
    capture.called += 1;
    capture.body = String(init?.body ?? "");
    const url = String(_url);
    const id = url.includes("refunds") ? "re_test_1" : "pi_test_123";
    return new Response(JSON.stringify({ id, status: "succeeded" }), { status: 200 });
  };
}

describe("server charge amount", () => {
  it("prices a deposit and a tip from the published menu", () => {
    const blowout = computeVisitCharge({
      shopId: "atelier",
      serviceId: "blowout",
      payChoice: "deposit",
      tipCents: 864,
    });
    assert.deepEqual(blowout, {
      ok: true,
      amountCents: 2304,
      tipCents: 864,
      serviceDueCents: 1440,
      payChoice: "deposit",
      policy: blowout.ok ? blowout.policy : undefined,
    });
    const crown = computeVisitCharge({
      shopId: "crown",
      serviceId: "balayage",
      payChoice: "deposit",
      tipCents: 0,
    });
    assert.equal(crown.ok, true);
    if (!crown.ok) return;
    assert.equal(crown.amountCents, 8800);
    assert.equal(crown.policy.depositPercent, 40);
    const tipped = computeVisitCharge({ shopId: "brooks", serviceId: "fade", payChoice: "full", tipCents: 50_000 });
    assert.equal(tipped.ok, true);
    if (!tipped.ok) return;
    assert.equal(tipped.amountCents, 53_800);
  });

  it("bounds the tip and ignores a price the browser invents", () => {
    const over = computeVisitCharge({ shopId: "brooks", serviceId: "fade", payChoice: "full", tipCents: 50_001 });
    assert.equal(over.ok, false);
    if (over.ok) return;
    assert.match(over.error, /Tip is out of range/);
    const missing = computeVisitCharge({ shopId: "brooks", serviceId: "not-a-service", payChoice: "full", tipCents: 0 });
    assert.equal(missing.ok, false);
  });

  it("charges the menu amount and rejects a tampered amount before calling the processor", async () => {
    const capture = { called: 0, body: "" };
    const paid = await authorizeCardCharge(chargeInput(), {
      now,
      ticketSecret,
      creds,
      fetchImpl: stripeFetch(capture),
    });
    assert.equal(paid.ok, true);
    if (!paid.ok) return;
    assert.equal(paid.amountCents, 2304);
    assert.match(capture.body, /amount=2304/);
    assert.equal(capture.body.includes("amount=100"), false);

    const tampered = { called: 0, body: "" };
    const rejected = await authorizeCardCharge(chargeInput({ amountCents: 100 }), {
      now,
      ticketSecret,
      creds,
      fetchImpl: stripeFetch(tampered),
    });
    assert.equal(rejected.ok, false);
    if (rejected.ok) return;
    assert.match(rejected.error, /doesn't match/);
    assert.equal(tampered.called, 0);

    const hugeTip = { called: 0, body: "" };
    const tipped = await authorizeCardCharge(chargeInput({ tipCents: 50_001, amountCents: 2304 }), {
      now,
      ticketSecret,
      creds,
      fetchImpl: stripeFetch(hugeTip),
    });
    assert.equal(tipped.ok, false);
    assert.equal(hugeTip.called, 0);
  });
});

describe("server refunds", () => {
  async function paidVisit(startIso: string) {
    const capture = { called: 0, body: "" };
    const paid = await authorizeCardCharge(chargeInput({ startIso, idempotencyKey: `idem-${startIso}` }), {
      now,
      ticketSecret,
      creds,
      fetchImpl: stripeFetch(capture),
    });
    assert.equal(paid.ok, true);
    if (!paid.ok) throw new Error("charge failed");
    return paid;
  }

  function refundInput(paid: { ticket: string; reference: string; amountCents: number }, amountCents = paid.amountCents) {
    return {
      provider: "stripe" as const,
      reference: paid.reference,
      amountCents,
      idempotencyKey: "idem-refund-1",
      ticket: paid.ticket,
      manageToken: "manage-token-123",
    };
  }

  it("refunds a visit for its manage token or an owner session, and not for anyone else", async () => {
    const paid = await paidVisit(later);
    const capture = { called: 0, body: "" };
    const refunded = await authorizeCardRefund(refundInput(paid), {
      now,
      ticketSecret,
      sessionSecret,
      ownerEmail: ownerCreds.ownerEmail,
      creds,
      fetchImpl: stripeFetch(capture),
    });
    assert.equal(refunded.ok, true);
    if (!refunded.ok) return;
    assert.equal(refunded.amountCents, 2304);
    assert.match(capture.body, /amount=2304/);

    const stranger = { called: 0, body: "" };
    const noToken = await authorizeCardRefund(
      { ...refundInput(paid), manageToken: undefined },
      { now, ticketSecret, sessionSecret, ownerEmail: ownerCreds.ownerEmail, creds, fetchImpl: stripeFetch(stranger) },
    );
    assert.equal(noToken.ok, false);
    if (noToken.ok) return;
    assert.match(noToken.error, /visit link or an owner session/);
    assert.equal(stranger.called, 0);

    const wrong = { called: 0, body: "" };
    const wrongToken = await authorizeCardRefund(
      { ...refundInput(paid), manageToken: "manage-token-nope" },
      { now, ticketSecret, sessionSecret, ownerEmail: ownerCreds.ownerEmail, creds, fetchImpl: stripeFetch(wrong) },
    );
    assert.equal(wrongToken.ok, false);
    assert.equal(wrong.called, 0);

    const signedIn = await authorizeOwnerSignIn(
      { email: "owner@shop.test", password: ownerPassword },
      { now, ...ownerCreds },
    );
    assert.equal(signedIn.ok, true);
    if (!signedIn.ok) return;
    assert.equal(signedIn.token.includes(ownerPassword), false);
    const ownerCapture = { called: 0, body: "" };
    const byOwner = await authorizeCardRefund(
      { ...refundInput(paid), manageToken: undefined, ownerToken: signedIn.token, idempotencyKey: "idem-owner" },
      { now, ticketSecret, sessionSecret, ownerEmail: ownerCreds.ownerEmail, creds, fetchImpl: stripeFetch(ownerCapture) },
    );
    assert.equal(byOwner.ok, true);
    assert.equal(ownerCapture.called, 1);

    const forged = { called: 0, body: "" };
    const forgedOwner = await authorizeCardRefund(
      { ...refundInput(paid), manageToken: undefined, ownerToken: `${signedIn.token}x`, idempotencyKey: "idem-forged" },
      { now, ticketSecret, sessionSecret, ownerEmail: ownerCreds.ownerEmail, creds, fetchImpl: stripeFetch(forged) },
    );
    assert.equal(forgedOwner.ok, false);
    assert.equal(forged.called, 0);
  });

  it("rejects refunds outside the cancellation window and refunds larger than the amount paid", async () => {
    const inside = await paidVisit(later);
    const tooMuch = { called: 0, body: "" };
    const over = await authorizeCardRefund(refundInput(inside, inside.amountCents + 100), {
      now,
      ticketSecret,
      sessionSecret,
      ownerEmail: ownerCreds.ownerEmail,
      creds,
      fetchImpl: stripeFetch(tooMuch),
    });
    assert.equal(over.ok, false);
    if (over.ok) return;
    assert.match(over.error, /larger than the amount paid/);
    assert.equal(tooMuch.called, 0);

    const outside = await paidVisit(soon);
    const late = { called: 0, body: "" };
    const rejected = await authorizeCardRefund(refundInput(outside), {
      now,
      ticketSecret,
      sessionSecret,
      ownerEmail: ownerCreds.ownerEmail,
      creds,
      fetchImpl: stripeFetch(late),
    });
    assert.equal(rejected.ok, false);
    if (rejected.ok) return;
    assert.match(rejected.error, /outside the cancellation window/);
    assert.equal(late.called, 0);
  });

  it("does not treat a tampered payment record as a booking", async () => {
    const paid = await paidVisit(later);
    const capture = { called: 0, body: "" };
    const flipped = `${paid.ticket.slice(0, -1)}${paid.ticket.endsWith("a") ? "b" : "a"}`;
    const rejected = await authorizeCardRefund({ ...refundInput(paid), ticket: flipped }, {
      now,
      ticketSecret,
      sessionSecret,
      ownerEmail: ownerCreds.ownerEmail,
      creds,
      fetchImpl: stripeFetch(capture),
    });
    assert.equal(rejected.ok, false);
    assert.equal(capture.called, 0);
  });
});

describe("owner session", () => {
  it("issues a server-signed session and lets it expire", async () => {
    const signedIn = await authorizeOwnerSignIn(
      { email: "owner@shop.test", password: ownerPassword },
      { now, ...ownerCreds },
    );
    assert.equal(signedIn.ok, true);
    if (!signedIn.ok) return;
    const paid = await authorizeCardCharge(chargeInput({ startIso: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() }), {
      now,
      ticketSecret,
      creds,
      fetchImpl: stripeFetch({ called: 0, body: "" }),
    });
    assert.equal(paid.ok, true);
    if (!paid.ok) return;
    const laterNow = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
    const capture = { called: 0, body: "" };
    const expired = await authorizeCardRefund(
      {
        provider: "stripe",
        reference: paid.reference,
        amountCents: paid.amountCents,
        idempotencyKey: "idem-expired",
        ticket: paid.ticket,
        ownerToken: signedIn.token,
      },
      { now: laterNow, ticketSecret, sessionSecret, ownerEmail: ownerCreds.ownerEmail, creds, fetchImpl: stripeFetch(capture) },
    );
    assert.equal(expired.ok, false);
    if (expired.ok) return;
    assert.match(expired.error, /owner session/);
    assert.equal(capture.called, 0);
  });
});

describe("Apple Pay in live mode", () => {
  it("stays a labeled demo and cannot mark a live visit paid", () => {
    assert.match(liveApplePayBlock(), /demo payment/);
    const panel = readFileSync(new URL("../components/pay-panel.tsx", import.meta.url), "utf8");
    const book = readFileSync(new URL("../components/shop-book.tsx", import.meta.url), "utf8");
    assert.match(panel, /Apple Pay \(demo\)/);
    assert.match(book, /liveApplePayBlock/);
    assert.equal(book.includes('status: result === "paid"'), false);
  });
});
