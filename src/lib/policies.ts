import { cents } from "./money.ts";
import type { Payment, Policy } from "./book-types.ts";

export function insideCancellationWindow(startIso: string, now: Date, windowHours: number): boolean {
  const start = new Date(startIso).getTime();
  if (Number.isNaN(start)) return false;
  return start - now.getTime() >= windowHours * 60 * 60 * 1000;
}

export function refundAmount(input: {
  startIso: string;
  now: Date;
  policy: Policy;
  payment: Payment;
}): number {
  if (input.payment.status !== "paid") return 0;
  if (!input.policy.refundInsideWindow) return 0;
  if (!insideCancellationWindow(input.startIso, input.now, input.policy.cancellationWindowHours)) {
    return 0;
  }
  return cents(input.payment.amount);
}

export function noShowFeeAmount(price: number, policy: Policy): number {
  const percent = Math.min(100, Math.max(0, policy.noShowFeePercent));
  return cents((price * percent) / 100);
}

export function cancellationDeadline(startIso: string, windowHours: number): Date {
  return new Date(new Date(startIso).getTime() - windowHours * 60 * 60 * 1000);
}

export function sanitizePolicy(input: Partial<Policy>): Policy {
  const hours = Number(input.cancellationWindowHours);
  const noShow = Number(input.noShowFeePercent);
  const deposit = Number(input.depositPercent);
  return {
    cancellationWindowHours: Number.isFinite(hours) ? Math.min(168, Math.max(0, Math.round(hours))) : 24,
    refundInsideWindow: input.refundInsideWindow !== false,
    noShowFeePercent: Number.isFinite(noShow) ? Math.min(100, Math.max(0, Math.round(noShow))) : 50,
    depositPercent: Number.isFinite(deposit) ? Math.min(100, Math.max(1, Math.round(deposit))) : 30,
    allowDeposit: input.allowDeposit !== false,
  };
}
