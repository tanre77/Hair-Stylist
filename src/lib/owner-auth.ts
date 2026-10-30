export type OwnerCheck =
  | { ok: true; email: string; name: string }
  | { ok: false; error: string };

function matchSecret(given: string, expected: string): boolean {
  const length = Math.max(given.length, expected.length);
  let diff = given.length === expected.length ? 0 : 1;
  for (let i = 0; i < length; i += 1) {
    diff |= (given.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function verifyOwner(input: {
  email: string;
  password: string;
  ownerEmail?: string;
  ownerPassword?: string;
  ownerName?: string;
}): OwnerCheck {
  const ownerEmail = input.ownerEmail?.trim() ?? "";
  const ownerPassword = input.ownerPassword ?? "";
  if (!ownerEmail || !ownerPassword) {
    return { ok: false, error: "Owner sign-in is not configured." };
  }
  const email = input.email.trim().toLowerCase();
  if (!matchSecret(email, ownerEmail.toLowerCase()) || !matchSecret(input.password, ownerPassword)) {
    return { ok: false, error: "Those credentials don't match." };
  }
  return { ok: true, email: ownerEmail, name: input.ownerName?.trim() || "Owner" };
}
