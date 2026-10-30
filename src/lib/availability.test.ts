import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { containsRawPan, tokenizeCard } from "./card-pay.ts";
import { demoCheckout } from "./demo-checkout.ts";
import { cancelAppointment, openSlots, rescheduleAppointment } from "./engine.ts";
import { createSeed } from "./seed.ts";

const now = new Date(2026, 5, 1, 8, 0, 0);

function seeded() {
  return createSeed(now);
}

function elena(state: ReturnType<typeof seeded>) {
  const appointment = state.appointments.find((item) => item.id === "seed-elena");
  if (!appointment) throw new Error("missing seed");
  return appointment;
}

describe("availability", () => {
  it("hides a chair that is already booked and keeps the buffer clear", () => {
    const state = seeded();
    const booked = elena(state);
    const day = new Date(booked.startIso);
    const andre = openSlots(state, {
      shopId: "brooks",
      serviceId: "fade",
      staffId: "andre",
      day,
      now,
    });
    assert.equal(
      andre.some((slot) => slot.startIso === booked.startIso),
      false,
    );
    const duringBuffer = andre.find((slot) => {
      const start = new Date(slot.startIso).getTime();
      const bookedStart = new Date(booked.startIso).getTime();
      return start > bookedStart && start < bookedStart + 60 * 60 * 1000;
    });
    assert.equal(duringBuffer, undefined);
  });

  it("offers another barber at the same time through any available", () => {
    const state = seeded();
    const booked = elena(state);
    const day = new Date(booked.startIso);
    const any = openSlots(state, {
      shopId: "brooks",
      serviceId: "fade",
      staffId: "any",
      day,
      now,
    });
    const sameTime = any.find((slot) => slot.startIso === booked.startIso);
    assert.ok(sameTime);
    assert.equal(sameTime.staffId, "malik");
  });

  it("keeps lunch blocks off the book", () => {
    const state = seeded();
    const booked = elena(state);
    const day = new Date(booked.startIso);
    const andre = openSlots(state, {
      shopId: "brooks",
      serviceId: "fade",
      staffId: "andre",
      day,
      now,
    });
    const lunch = andre.find((slot) => {
      const minutes = new Date(slot.startIso).getHours() * 60 + new Date(slot.startIso).getMinutes();
      return minutes >= 12 * 60 && minutes < 13 * 60;
    });
    assert.equal(lunch, undefined);
  });

  it("refuses a second booking on the same chair and time", () => {
    const state = seeded();
    const booked = elena(state);
    const day = new Date(booked.startIso);
    const open = openSlots(state, {
      shopId: "brooks",
      serviceId: "fade",
      staffId: "malik",
      day,
      now,
    });
    const slot = open[0];
    assert.ok(slot);
    const first = demoCheckout(state, {
      id: "one",
      token: "tok-one",
      receiptId: "r1",
      clientId: "c1",
      shopId: "brooks",
      staffId: slot.staffId,
      serviceId: "fade",
      startIso: slot.startIso,
      client: { name: "Noah Kim", email: "noah@example.com", phone: "614-555-0101" },
      payChoice: "full",
      tipPreset: "20",
      customTip: 0,
      now,
      method: "card",
      card: { pan: "4242424242424242", exp: "12/30", cvc: "123", postal: "43065" },
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    const second = demoCheckout(first.state, {
      id: "two",
      token: "tok-two",
      receiptId: "r2",
      clientId: "c2",
      shopId: "brooks",
      staffId: slot.staffId,
      serviceId: "fade",
      startIso: slot.startIso,
      client: { name: "Ava Cole", email: "ava@example.com", phone: "614-555-0102" },
      payChoice: "deposit",
      tipPreset: "custom",
      customTip: 5,
      now,
      method: "card",
      card: { pan: "5555555555554444", exp: "11/29", cvc: "321", postal: "43215" },
    });
    assert.equal(second.ok, false);
    if (second.ok) return;
    assert.match(second.error, /taken/);
  });

  it("frees the old time when a visit moves, and will not land on a taken one", () => {
    const state = seeded();
    const booked = elena(state);
    const day = new Date(booked.startIso);
    const malik = openSlots(state, {
      shopId: "brooks",
      serviceId: "fade",
      staffId: "malik",
      day,
      now,
    })[0];
    assert.ok(malik);
    const moved = rescheduleAppointment(state, {
      id: booked.id,
      startIso: malik.startIso,
      staffId: "malik",
      now,
    });
    assert.equal(moved.ok, true);
    if (!moved.ok) return;
    const andreAgain = openSlots(moved.state, {
      shopId: "brooks",
      serviceId: "fade",
      staffId: "andre",
      day,
      now,
    });
    assert.equal(
      andreAgain.some((slot) => slot.startIso === booked.startIso),
      true,
    );
    const andreOpen = openSlots(moved.state, {
      shopId: "brooks",
      serviceId: "fade",
      staffId: "andre",
      day,
      now,
    }).find((slot) => slot.startIso !== malik.startIso);
    assert.ok(andreOpen);
    const other = demoCheckout(moved.state, {
      id: "other",
      token: "tok-other",
      receiptId: "r-other",
      clientId: "c-other",
      shopId: "brooks",
      staffId: "andre",
      serviceId: "fade",
      startIso: andreOpen.startIso,
      client: { name: "Ava Cole", email: "ava@example.com", phone: "614-555-0108" },
      payChoice: "full",
      tipPreset: "0",
      customTip: 0,
      now,
      method: "apple",
    });
    assert.equal(other.ok, true);
    if (!other.ok) return;
    const clash = rescheduleAppointment(other.state, {
      id: "other",
      startIso: malik.startIso,
      staffId: "malik",
      now,
    });
    assert.equal(clash.ok, false);
  });
});

describe("demo payments", () => {
  it("charges a deposit or the full visit with a preset or custom tip and writes a receipt", () => {
    const state = seeded();
    const booked = elena(state);
    const day = new Date(booked.startIso);
    const slot = openSlots(state, {
      shopId: "atelier",
      serviceId: "blowout",
      staffId: "priya",
      day,
      now,
    }).find((item) => item.staffId === "priya");
    assert.ok(slot);
    const paid = demoCheckout(state, {
      id: "blow",
      token: "tok-blow",
      receiptId: "r-blow",
      clientId: "c-blow",
      shopId: "atelier",
      staffId: "priya",
      serviceId: "blowout",
      startIso: slot.startIso,
      client: { name: "Noah Kim", email: "noah@example.com", phone: "614-555-0101" },
      payChoice: "deposit",
      tipPreset: "18",
      customTip: 0,
      now,
      method: "card",
      card: { pan: "4242 4242 4242 4242", exp: "12 / 30", cvc: "123", postal: "43065" },
    });
    assert.equal(paid.ok, true);
    if (!paid.ok) return;
    assert.equal(paid.appointment.payChoice, "deposit");
    assert.equal(paid.appointment.price, 48);
    assert.equal(paid.appointment.tip, 8.64);
    assert.equal(paid.appointment.dueToday, 23.04);
    assert.equal(paid.appointment.balanceAtVisit, 33.6);
    assert.equal(paid.receipt.kind, "payment");
    assert.equal(paid.receipt.total, 23.04);
    assert.equal(paid.appointment.payment.last4, "4242");
    assert.equal(paid.appointment.payment.provider, "demo");
    assert.equal(containsRawPan(paid), false);
    assert.equal(JSON.stringify(paid).includes("4242424242424242"), false);
  });

  it("mocks Venmo and Apple Pay without storing a card number", () => {
    const state = seeded();
    const day = new Date(elena(state).startIso);
    const slot = openSlots(state, {
      shopId: "brooks",
      serviceId: "kids",
      staffId: "malik",
      day,
      now,
    })[0];
    assert.ok(slot);
    for (const method of ["venmo", "apple"] as const) {
      const paid = demoCheckout(state, {
        id: method,
        token: `tok-${method}`,
        receiptId: `r-${method}`,
        clientId: `c-${method}`,
        shopId: "brooks",
        staffId: slot.staffId,
        serviceId: "kids",
        startIso: slot.startIso,
        client: { name: "Noah Kim", email: `${method}@example.com`, phone: "614-555-0199" },
        payChoice: "full",
        tipPreset: "custom",
        customTip: 4,
        now,
        method,
      });
      assert.equal(paid.ok, true);
      if (!paid.ok) return;
      assert.equal(paid.appointment.payment.method, method);
      assert.equal(paid.appointment.payment.status, "paid");
      assert.equal(paid.appointment.payment.provider, "demo");
      assert.equal(paid.appointment.tip, 4);
      assert.equal(paid.appointment.dueToday, 30);
      assert.equal(containsRawPan(paid.state), false);
    }
  });

  it("refunds a cancellation inside the window and keeps the payment outside it", () => {
    const state = seeded();
    const booked = elena(state);
    const early = new Date(new Date(booked.startIso).getTime() - 48 * 60 * 60 * 1000);
    const refunded = cancelAppointment(state, { id: booked.id, now: early, refundReference: "demo_re_elena" });
    assert.equal(refunded.ok, true);
    if (!refunded.ok) return;
    assert.equal(refunded.insideWindow, true);
    assert.equal(refunded.refund, booked.dueToday);
    const updated = refunded.state.appointments.find((item) => item.id === booked.id);
    assert.equal(updated?.status, "cancelled");
    assert.equal(updated?.payment.status, "refunded");
    assert.ok(refunded.state.receipts.some((receipt) => receipt.kind === "refund" && receipt.appointmentId === booked.id));
    const again = openSlots(refunded.state, {
      shopId: "brooks",
      serviceId: "fade",
      staffId: "andre",
      day: new Date(booked.startIso),
      now: early,
    });
    assert.equal(
      again.some((slot) => slot.startIso === booked.startIso),
      true,
    );

    const late = new Date(new Date(booked.startIso).getTime() - 2 * 60 * 60 * 1000);
    const kept = cancelAppointment(state, { id: booked.id, now: late });
    assert.equal(kept.ok, true);
    if (!kept.ok) return;
    assert.equal(kept.insideWindow, false);
    assert.equal(kept.refund, 0);
    assert.equal(kept.state.appointments.find((item) => item.id === booked.id)?.payment.status, "paid");
  });

  it("rejects a card number that fails the check and never echoes it back", () => {
    const bad = tokenizeCard(
      { pan: "4242424242424241", exp: "12/30", cvc: "123", postal: "43065" },
      now,
    );
    assert.equal(bad.ok, false);
    const good = tokenizeCard(
      { pan: "4242424242424242", exp: "12/30", cvc: "123", postal: "43065" },
      now,
    );
    assert.equal(good.ok, true);
    if (!good.ok) return;
    assert.equal("pan" in good.token, false);
    assert.equal(JSON.stringify(good.token).includes("4242424242424242"), false);
    assert.equal(containsRawPan({ last4: good.token.last4, token: good.token.token }), false);
    assert.equal(containsRawPan({ sneaky: "4242424242424242" }), true);
  });
});
