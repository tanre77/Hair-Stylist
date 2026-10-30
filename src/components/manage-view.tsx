import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { cancellationDeadline, refundAmount } from "@/lib/policies";
import { cn } from "@/lib/cn";
import {
  appointmentByToken,
  clientById,
  openSlots,
  policyFor,
  receiptsFor,
  serviceById,
  staffForShop,
} from "@/lib/engine";
import { money } from "@/lib/money";
import { cancelVisit, moveAppointment, useStore } from "@/lib/store";
import { upcomingDays } from "@/lib/time";
import { useDemoMode } from "@/lib/use-demo";
import { primaryClass, quietClass } from "./classes";
import { ReceiptCard } from "./receipt-card";

export function ManageView({ token }: { token: string }) {
  const store = useStore();
  const demo = useDemoMode();
  const [now, setNow] = useState<Date | null>(null);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slotIso, setSlotIso] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string>("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const appointment = store.ready ? appointmentByToken(store.book, token) : undefined;
  const policy = appointment ? policyFor(store.book, appointment.shopId) : null;
  const service = appointment ? serviceById(store.book, appointment.serviceId) : undefined;
  const people = appointment ? staffForShop(store.book, appointment.shopId) : [];
  const eligible = service ? people.filter((member) => service.staffIds.includes(member.id)) : people;

  useEffect(() => {
    if (appointment && !staffId) setStaffId(appointment.staffId);
  }, [appointment, staffId]);

  const days = useMemo(() => (now ? upcomingDays(7, now) : []), [now]);
  const activeDay = days.find((day) => day.toDateString() === dayKey) ?? days[0] ?? null;
  const slots =
    now && activeDay && appointment && staffId && appointment.status === "booked"
      ? openSlots(store.book, {
          shopId: appointment.shopId,
          serviceId: appointment.serviceId,
          staffId,
          day: activeDay,
          now,
          ignoreAppointmentId: appointment.id,
        })
      : [];

  if (!store.ready || !now) return <p className="text-sm text-stone">Opening the book…</p>;
  if (!appointment || !policy) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-4xl">That visit link isn't on this device.</h1>
        <Link to="/visits" className="mt-4 inline-flex h-11 items-center text-oxblood">
          Your visits
        </Link>
      </div>
    );
  }

  const refund = refundAmount({
    startIso: appointment.startIso,
    now,
    policy,
    payment: appointment.payment,
  });
  const deadline = cancellationDeadline(appointment.startIso, policy.cancellationWindowHours);
  const receipts = receiptsFor(store.book, appointment.id);
  const client = clientById(store.book, appointment.clientId);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <p className="text-xs font-medium tracking-widest text-stone uppercase">Visit link</p>
      <div>
        <h1 className="font-display text-4xl">{appointment.serviceName}</h1>
        <p className="mt-2 text-stone">
          {appointment.shopName} · {appointment.staffName}
        </p>
        <p className="mt-1 tabular-nums">{format(new Date(appointment.startIso), "EEE, MMM d · h:mm a")}</p>
        <p className="mt-1 text-sm text-stone">{client?.name}</p>
      </div>

      {appointment.status !== "booked" && (
        <p className="rounded-2xl bg-cream px-4 py-3 text-sm ring-1 ring-line">
          This visit is {appointment.status === "cancelled" ? "cancelled" : appointment.status === "no_show" ? "marked as a no-show" : "completed"}.
          {appointment.refundAmount ? ` ${money(appointment.refundAmount)} was returned.` : ""}
          {appointment.noShowFee ? ` No-show fee ${money(appointment.noShowFee)}.` : ""}
        </p>
      )}

      {receipts.map((receipt) => (
        <ReceiptCard key={receipt.id} receipt={receipt} />
      ))}

      {appointment.status === "booked" && (
        <>
          <section className="rounded-2xl bg-cream p-4 ring-1 ring-line">
            <h2 className="font-display text-2xl">Move it</h2>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {eligible.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    setStaffId(member.id);
                    setSlotIso(null);
                  }}
                  className={cn(
                    "h-10 shrink-0 rounded-full px-3 text-sm",
                    staffId === member.id ? "bg-ink text-foam" : "bg-paper ring-1 ring-line",
                  )}
                >
                  {member.name.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {days.map((day) => (
                <button
                  key={day.toDateString()}
                  type="button"
                  onClick={() => {
                    setDayKey(day.toDateString());
                    setSlotIso(null);
                  }}
                  className={cn(
                    "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-sm",
                    activeDay && day.toDateString() === activeDay.toDateString() ? "bg-ink text-foam" : "bg-paper ring-1 ring-line",
                  )}
                >
                  <span className="text-xs">{format(day, "EEE")}</span>
                  <span className="tabular-nums">{format(day, "d")}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {slots.length === 0 && <p className="col-span-3 text-sm text-stone">No open times this day.</p>}
              {slots.map((slot) => (
                <button
                  key={slot.startIso}
                  type="button"
                  onClick={() => setSlotIso(slot.startIso)}
                  className={cn(
                    "h-11 rounded-full text-sm tabular-nums",
                    slotIso === slot.startIso ? "bg-oxblood text-foam" : "bg-paper ring-1 ring-line",
                  )}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!slotIso || !staffId}
              className={cn(primaryClass, "mt-3")}
              onClick={() => {
                if (!slotIso) return;
                const result = moveAppointment(appointment.id, slotIso, staffId);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setMessage("Moved. The old time is open again.");
                setError("");
                setSlotIso(null);
              }}
            >
              Reschedule
            </button>
          </section>

          <section className="rounded-2xl bg-cream p-4 ring-1 ring-line">
            <h2 className="font-display text-2xl">Cancel</h2>
            <p className="mt-2 text-sm text-stone">
              Cancel free of charge before {format(deadline, "EEE, MMM d · h:mm a")}. Inside that window
              {refund > 0 ? `, ${money(refund)} comes back.` : ", a paid visit is returned."} After it, the payment stays with the shop.
              A no-show is {policy.noShowFeePercent}% of the service.
            </p>
            <button
              type="button"
              disabled={busy}
              className={cn(quietClass, "mt-3")}
              onClick={() => {
                setBusy(true);
                setError("");
                void (async () => {
                  try {
                    let refundReference: string | undefined;
                    const provider = appointment.payment.provider;
                    if (!demo && refund > 0 && (provider === "stripe" || provider === "square")) {
                      const { refundCardPayment } = await import("@/lib/server-fns");
                      const refunded = await refundCardPayment({
                        data: {
                          provider,
                          reference: appointment.payment.reference,
                          amountCents: Math.round(refund * 100),
                          idempotencyKey: crypto.randomUUID(),
                        },
                      });
                      if (!refunded.ok) {
                        setError(refunded.error);
                        return;
                      }
                      refundReference = refunded.reference;
                    }
                    const result = cancelVisit(appointment.id, refundReference ?? (refund > 0 ? `demo_re_${appointment.id}` : undefined));
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    setMessage(
                      result.refund > 0
                        ? `${money(result.refund)} returned. The chair is open.`
                        : "Cancelled. The payment stays with the shop.",
                    );
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            >
              Cancel this visit
            </button>
          </section>
        </>
      )}
      {error && (
        <p className="text-sm text-oxblood" role="alert">
          {error}
        </p>
      )}
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
