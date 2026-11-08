/** HMAC tokens the server can check later. The payload is not encrypted. */

export function timingSafeEqualString(given: string, expected: string): boolean {
  const length = Math.max(given.length, expected.length);
  let diff = given.length === expected.length ? 0 : 1;
  for (let i = 0; i < length; i += 1) {
    diff |= (given.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i] ?? 0);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToString(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bytesToBase64Url(new Uint8Array(mac));
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function signJson(secret: string, payload: Record<string, unknown>): Promise<string> {
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const mac = await hmac(secret, `v1.${body}`);
  return `v1.${body}.${mac}`;
}

/** Returns the payload only when the signature and expiry check out. */
export async function openJson(token: string, secret: string, now: Date): Promise<Record<string, unknown> | null> {
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const body = parts[1];
  const mac = parts[2];
  if (!body || !mac) return null;
  const expected = await hmac(secret, `v1.${body}`);
  if (!timingSafeEqualString(mac, expected)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(base64UrlToString(body));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  if (typeof record.exp !== "number" || !Number.isFinite(record.exp)) return null;
  if (record.exp * 1000 + 30_000 < now.getTime()) return null;
  return record;
}
