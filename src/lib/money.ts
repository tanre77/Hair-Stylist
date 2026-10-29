export function cents(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export function money(n: number) {
  return cents(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
