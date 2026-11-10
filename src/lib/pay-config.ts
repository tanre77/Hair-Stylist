export type PublicEnv = Record<string, string | boolean | undefined>;

export function envString(env: PublicEnv, key: string): string {
  const value = env[key];
  return typeof value === "string" ? value.trim() : "";
}

export function hasPublicPaymentKeys(env: PublicEnv): boolean {
  const stripe = envString(env, "VITE_STRIPE_PUBLISHABLE_KEY");
  const squareApp = envString(env, "VITE_SQUARE_APPLICATION_ID");
  const squareLoc = envString(env, "VITE_SQUARE_LOCATION_ID");
  return Boolean(stripe || (squareApp && squareLoc));
}

export type PaymentMode =
  | { demo: true; provider: "demo" }
  | { demo: false; provider: "stripe"; publishableKey: string }
  | { demo: false; provider: "square"; applicationId: string; locationId: string };

/**
 * Demo is on when `?demo=1` or `VITE_DEMO_MODE` is 1/true/on.
 * `VITE_DEMO_MODE=0` forces it off. Otherwise demo is the default when
 * publishable card keys are missing.
 * A `demo=1` query always wins, so a live shop can still open the preview.
 */
export function resolveDemoMode(input: {
  search?: string;
  envDemo?: string;
  hasPaymentKeys: boolean;
}): boolean {
  const params = new URLSearchParams((input.search ?? "").replace(/^\?/, ""));
  if (params.get("demo") === "1") return true;
  const flag = (input.envDemo ?? "").trim().toLowerCase();
  if (flag === "1" || flag === "true" || flag === "on") return true;
  if (flag === "0" || flag === "false" || flag === "off") return false;
  return !input.hasPaymentKeys;
}

export function paymentMode(input: { demo: boolean; env: PublicEnv }): PaymentMode {
  if (input.demo) return { demo: true, provider: "demo" };
  const stripe = envString(input.env, "VITE_STRIPE_PUBLISHABLE_KEY");
  if (stripe) return { demo: false, provider: "stripe", publishableKey: stripe };
  const applicationId = envString(input.env, "VITE_SQUARE_APPLICATION_ID");
  const locationId = envString(input.env, "VITE_SQUARE_LOCATION_ID");
  if (applicationId && locationId) {
    return { demo: false, provider: "square", applicationId, locationId };
  }
  return { demo: true, provider: "demo" };
}
