import { cents } from "./money.ts";
import type { Policy } from "./book-types.ts";

export type TipPreset = "0" | "15" | "18" | "20" | "25" | "custom";

export const TIP_PRESETS: Array<{ id: TipPreset; label: string }> = [
  { id: "0", label: "No tip" },
  { id: "15", label: "15%" },
  { id: "18", label: "18%" },
  { id: "20", label: "20%" },
  { id: "25", label: "25%" },
  { id: "custom", label: "Custom" },
];

export function tipAmount(price: number, preset: TipPreset, customDollars: number): number {
  if (preset === "custom") return cents(Math.max(0, customDollars || 0));
  return cents((price * Number(preset)) / 100);
}

export type Quote = {
  choice: "deposit" | "full";
  serviceDue: number;
  tip: number;
  dueToday: number;
  balanceAtVisit: number;
};

export function quoteVisit(input: {
  price: number;
  policy: Policy;
  choice: "deposit" | "full";
  tip: number;
}): Quote {
  const choice = input.policy.allowDeposit ? input.choice : "full";
  const serviceDue =
    choice === "deposit" ? cents((input.price * input.policy.depositPercent) / 100) : cents(input.price);
  const tip = cents(Math.max(0, input.tip));
  return {
    choice,
    serviceDue,
    tip,
    dueToday: cents(serviceDue + tip),
    balanceAtVisit: cents(input.price - serviceDue),
  };
}
