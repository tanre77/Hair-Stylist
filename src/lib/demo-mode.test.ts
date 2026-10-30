import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { accountChrome, loginCopy, loginSurface } from "./account-chrome.ts";
import { resolveDemoMode } from "./pay-config.ts";

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (entry.endsWith(".tsx")) files.push(path);
  }
  return files;
}

describe("demo mode", () => {
  it("turns on from the env flag, the query, or missing payment keys", () => {
    assert.equal(resolveDemoMode({ search: "", envDemo: undefined, hasPaymentKeys: false }), true);
    assert.equal(resolveDemoMode({ search: "", envDemo: "1", hasPaymentKeys: true }), true);
    assert.equal(resolveDemoMode({ search: "?demo=1", envDemo: "0", hasPaymentKeys: true }), true);
    assert.equal(resolveDemoMode({ search: "", envDemo: undefined, hasPaymentKeys: true }), false);
    assert.equal(resolveDemoMode({ search: "", envDemo: "0", hasPaymentKeys: false }), false);
  });

  it("never offers sign-in while demo mode is on", () => {
    const chrome = accountChrome({ demo: true, ownerName: "Owner" });
    const copy = loginCopy(true);
    const blob = JSON.stringify({ chrome, copy, surface: loginSurface(true) });
    assert.equal(chrome.kind, "guest");
    assert.equal(chrome.label, "Demo guest");
    assert.equal(chrome.prompt, null);
    assert.equal(copy.kind, "hidden");
    assert.equal(loginSurface(true), "redirect");
    assert.doesNotMatch(blob, /sign[\s-]?in|log[\s-]?in|password/i);
  });

  it("shows owner sign-in only when demo mode is off", () => {
    const chrome = accountChrome({ demo: false, ownerName: null });
    const copy = loginCopy(false);
    assert.equal(chrome.prompt, "Sign in");
    assert.equal(copy.kind, "form");
    assert.equal(loginSurface(false), "form");
    if (copy.kind !== "form") return;
    assert.equal(copy.heading, "Sign in");
    assert.equal(copy.passwordLabel, "Password");
  });

  it("keeps sign-in words out of the screens and routes", () => {
    const banned = /\bSign in\b|\bLog in\b|\bLogin\b|Create account/;
    const hits = [...walk("src/components"), ...walk("src/routes")].filter((file) =>
      banned.test(readFileSync(file, "utf8")),
    );
    assert.deepEqual(hits, []);
  });
});
