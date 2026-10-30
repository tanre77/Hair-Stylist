import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openSlots } from "./engine.ts";
import { createSeed } from "./seed.ts";

describe("performance", () => {
  it("builds a week of open slots for every shop quickly", () => {
    const now = new Date(2026, 5, 1, 8, 0, 0);
    const state = createSeed(now);
    const started = performance.now();
    let count = 0;
    for (let pass = 0; pass < 12; pass += 1) {
      for (const shop of state.shops) {
        const service = state.services.find((item) => item.shopId === shop.id);
        if (!service) continue;
        for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
          const day = new Date(now);
          day.setDate(now.getDate() + dayOffset);
          count += openSlots(state, {
            shopId: shop.id,
            serviceId: service.id,
            staffId: "any",
            day,
            now,
          }).length;
        }
      }
    }
    const elapsed = performance.now() - started;
    assert.ok(count > 0);
    assert.ok(elapsed < 250, `slot generation took ${elapsed.toFixed(1)}ms`);
  });
});
