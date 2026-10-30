import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronLeft, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { APP_NAME } from "@/lib/brand";
import type { Appointment, Receipt } from "@/lib/book-types";
import { quoteVisit, tipAmount, type TipPreset } from "@/lib/checkout";
import { cn } from "@/lib/cn";
import { openSlots, policyFor, servicesForShop, shopById, staffForShop } from "@/lib/engine";
import { formatMiles, milesBetween, useLocation } from "@/lib/geo";
import { money } from "@/lib/money";
import { paymentMode } from "@/lib/pay-config";
import { applePayAvailable, openVenmo, startApplePay, validVenmo } from "@/lib/payments";
import { checkoutDemo, checkoutLive, useStore } from "@/lib/store";
import { durationLabel, upcomingDays } from "@/lib/time";
import { publicEnv, useDemoMode } from "@/lib/use-demo";
import { primaryClass } from "./classes";
import { PayPanel, type PayChoice } from "./pay-panel";
import { ReceiptCard } from "./receipt-card";

export function ShopBook({ shopId, initialStaffId }: { shopId: string; initialStaffId?: string }) {
  const store = useStore();
  const demo = useDemoMode();
  const mode = paymentMode({ demo, env: publicEnv() });
  const { place } = useLocation();
  const [now, setNow] = useState<Date | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState<string>(initialStaffId || "any");
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slotIso, setSlotIso] = useState<string | null>(null);
  const [slotStaff, setSlotStaff] = useState<string | null>(null);
  const [choice, setChoice] = useState<PayChoice>("deposit");
  const [tipPreset, setTipPreset] = useState<TipPreset>("18");
  const [customTip, setCustomTip] = useState("");
  const [name, setName] = useState(store.clientName);
  const [email, setEmail] = useState(store.clientEmail);
  const [phone, setPhone] = useState(store.clientPhone);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ appointment: Appointment; receipt: Receipt } | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const shop = shopById(store.book, shopId);
  const services = useMemo(
    () => (shop ? servicesForShop(store.book, shop.id) : []),
    [shop, store.book],
  );
  const staff = shop ? staffForShop(store.book, shop.id) : [];
  const service = services.find((item) => item.id === serviceId) ?? services[0];
  const policy = shop ? policyFor(store.book, shop.id) : policyFor(store.book, "");

  useEffect(() => {
    if (serviceId || services.length === 0) return;
    const preferred =
      (initialStaffId && services.find((item) => item.staffIds.includes(initialStaffId))) || services[0];
    if (preferred) setServiceId(preferred.id);
  }, [initialStaffId, serviceId, services]);

  useEffect(() => {
    setName(store.clientName);
    setEmail(store.clientEmail);
    setPhone(store.clientPhone);
  }, [store.clientEmail, store.clientName, store.clientPhone]);

  const days = useMemo(() => (now ? upcomingDays(7, now) : []), [now]);
  const activeDay = days.find((day) => day.toDateString() === dayKey) ?? days[0] ?? null;
  const slots =
    now && activeDay && service && shop
      ? openSlots(store.book, {
          shopId: shop.id,
          serviceId: service.id,
          staffId: staffId === "any" ? "any" : staffId,
          day: activeDay,
          now,
        })
      : [];

  const tip = service ? tipAmount(service.price, tipPreset, Number(customTip) || 0) : 0;
  const quote = service
    ? quoteVisit({ price: service.price, policy, choice, tip })
    : quoteVisit({ price: 0, policy, choice, tip: 0 });

  if (!store.ready) return <p className="text-sm text-stone">Opening the book…</p>;
  if (!shop || !service) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-4xl">That shop isn't on the book.</h1>
        <Link to="/" className="mt-4 inline-flex h-12 items-center text-oxblood">
          Back to shops
        </Link>
      </div>
    );
  }

  const miles = milesBetween(place.lat, place.lng, shop.lat, shop.lng);
  const chosenStaff = staff.find((member) => member.id === (slotStaff || (staffId === "any" ? "" : staffId)));

  function client() {
    return { name: name.trim(), email: email.trim(), phone: phone.trim() };
  }

  function finish(result: { ok: true; appointment: Appointment; receipt: Receipt } | { ok: false; error: string }) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone({ appointment: result.appointment, receipt: result.receipt });
    setError("");
  }

  function requireSlot() {
    if (!slotIso || !slotStaff) {
      setError("Pick an open time first.");
      return false;
    }
    if (name.trim().length < 2) {
      setError("Add the name for the chair.");
      return false;
    }
    return true;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="inline-flex h-11 items-center gap-1 text-sm text-stone">
        <ChevronLeft className="size-4" aria-hidden="true" />
        All shops
      </Link>
      <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col gap-5">
          <img src={shop.image} alt="" className="h-72 w-full rounded-2xl object-cover object-top ring-1 ring-line" />
          <div>
            <p className="text-sm text-stone">
              {shop.kind === "barbershop" ? "Barbershop" : "Salon"} · {shop.neighborhood}
            </p>
            <h1 className="mt-1 font-display text-4xl lg:text-5xl">{shop.name}</h1>
            <p className="mt-2 text-sm text-stone">
              {shop.address} · {formatMiles(miles)} from {place.source === "device" ? "you" : place.label}
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-sm tabular-nums">
              <Star className="size-4 fill-brass text-brass" aria-hidden="true" />
              {shop.rating.toFixed(1)} · {shop.reviews} reviews
            </p>
          </div>
          <p className="max-w-xl">{shop.blurb}</p>

          <div>
            <h2 className="font-display text-2xl">Service</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {services.map((item) => {
                const on = item.id === service.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setServiceId(item.id);
                        setSlotIso(null);
                        setSlotStaff(null);
                        if (!item.staffIds.includes(staffId) && staffId !== "any") setStaffId("any");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ring-1",
                        on ? "bg-cream ring-oxblood" : "bg-cream ring-line",
                      )}
                    >
                      <span>
                        <span className="block font-medium">{item.name}</span>
                        <span className="block text-sm text-stone">
                          {item.blurb} · {durationLabel(item.durationMin)}
                          {(item.bufferBeforeMin > 0 || item.bufferAfterMin > 0) &&
                            ` · ${item.bufferBeforeMin + item.bufferAfterMin} min buffer`}
                        </span>
                      </span>
                      <span className="tabular-nums">{money(item.price)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl">Who</h2>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                aria-pressed={staffId === "any"}
                onClick={() => {
                  setStaffId("any");
                  setSlotIso(null);
                }}
                className={cn(
                  "h-20 w-36 shrink-0 rounded-2xl px-3 text-left text-sm",
                  staffId === "any" ? "bg-ink text-foam" : "bg-cream ring-1 ring-line",
                )}
              >
                <span className="block font-medium">Any available</span>
                <span className="block text-xs opacity-80">First open chair</span>
              </button>
              {staff
                .filter((member) => service.staffIds.includes(member.id))
                .map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    aria-pressed={staffId === member.id}
                    onClick={() => {
                      setStaffId(member.id);
                      setSlotIso(null);
                    }}
                    className={cn(
                      "flex h-20 w-44 shrink-0 items-center gap-2 rounded-2xl px-3 text-left text-sm",
                      staffId === member.id ? "bg-ink text-foam" : "bg-cream ring-1 ring-line",
                    )}
                  >
                    <img src={member.portrait} alt="" className="size-12 rounded-full object-cover" />
                    <span>
                      <span className="block font-medium">{member.name}</span>
                      <span className="block text-xs opacity-80">{member.role}</span>
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </section>

        <aside className="rounded-2xl bg-cream p-4 ring-1 ring-line lg:sticky lg:top-24">
          {done ? (
            <div className="flex flex-col gap-4">
              <ReceiptCard receipt={done.receipt} />
              <p className="text-sm text-stone">
                {format(new Date(done.appointment.startIso), "EEE, MMM d · h:mm a")} with {done.appointment.staffName}.
                Move or cancel from the visit link.
              </p>
              <Link to="/m/$token" params={{ token: done.appointment.token }} className={primaryClass}>
                Open the visit link
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-display text-3xl">Book</h2>
                <p className="text-sm text-stone">
                  {service.name} · {durationLabel(service.durationMin)}
                  {chosenStaff ? ` · ${chosenStaff.name}` : staffId === "any" ? " · any open chair" : ""}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Day</p>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {days.map((day) => {
                    const on = activeDay ? day.toDateString() === activeDay.toDateString() : false;
                    const closed =
                      staffId !== "any" &&
                      !staff.find((member) => member.id === staffId)?.weekly[day.getDay()];
                    return (
                      <button
                        key={day.toDateString()}
                        type="button"
                        onClick={() => {
                          setDayKey(day.toDateString());
                          setSlotIso(null);
                          setSlotStaff(null);
                        }}
                        className={cn(
                          "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-sm",
                          on ? "bg-ink text-foam" : "bg-paper text-ink ring-1 ring-line",
                          closed && !on && "opacity-50",
                        )}
                      >
                        <span className="text-xs">{format(day, "EEE")}</span>
                        <span className="font-medium tabular-nums">{format(day, "d")}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Open times</p>
                {!now ? (
                  <p className="mt-2 text-sm text-stone">Checking the book…</p>
                ) : slots.length === 0 ? (
                  <p className="mt-2 text-sm text-stone">Nothing open this day. Try another person or the next day.</p>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((slot) => {
                      const on = slot.startIso === slotIso && slot.staffId === slotStaff;
                      return (
                        <button
                          key={`${slot.staffId}-${slot.startIso}`}
                          type="button"
                          onClick={() => {
                            setSlotIso(slot.startIso);
                            setSlotStaff(slot.staffId);
                            setError("");
                          }}
                          className={cn(
                            "h-14 rounded-2xl text-sm",
                            on ? "bg-oxblood text-foam" : "bg-paper ring-1 ring-line",
                          )}
                        >
                          <span className="block tabular-nums">{slot.label}</span>
                          {staffId === "any" && <span className="block text-xs opacity-80">{slot.staffName.split(" ")[0]}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <PayPanel
                quote={quote}
                allowDeposit={policy.allowDeposit}
                depositPercent={policy.depositPercent}
                tipPreset={tipPreset}
                customTip={customTip}
                choice={policy.allowDeposit ? choice : "full"}
                onChoice={setChoice}
                onTipPreset={setTipPreset}
                onCustomTip={setCustomTip}
                name={name}
                email={email}
                phone={phone}
                onName={setName}
                onEmail={setEmail}
                onPhone={setPhone}
                mode={mode}
                busy={busy}
                error={error}
                onDemoCard={(card) => {
                  if (!requireSlot() || !slotIso || !slotStaff) return;
                  setBusy(true);
                  finish(
                    checkoutDemo({
                      shopId: shop.id,
                      staffId: slotStaff,
                      serviceId: service.id,
                      startIso: slotIso,
                      client: client(),
                      payChoice: policy.allowDeposit ? choice : "full",
                      tipPreset,
                      customTip: Number(customTip) || 0,
                      method: "card",
                      card,
                    }),
                  );
                  setBusy(false);
                }}
                onWallet={(method) => {
                  if (!requireSlot() || !slotIso || !slotStaff) return;
                  setBusy(true);
                  const guest = client();
                  if (demo) {
                    finish(
                      checkoutDemo({
                        shopId: shop.id,
                        staffId: slotStaff,
                        serviceId: service.id,
                        startIso: slotIso,
                        client: guest,
                        payChoice: policy.allowDeposit ? choice : "full",
                        tipPreset,
                        customTip: Number(customTip) || 0,
                        method,
                      }),
                    );
                    setBusy(false);
                    return;
                  }
                  void (async () => {
                    try {
                      if (method === "venmo") {
                        if (!validVenmo(shop.venmo)) {
                          setError("This shop has no usable Venmo username.");
                          return;
                        }
                        const note = `${APP_NAME} · ${service.name} · ${guest.name}`;
                        openVenmo(shop.venmo, quote.dueToday, note);
                        finish(
                          checkoutLive({
                            shopId: shop.id,
                            staffId: slotStaff,
                            serviceId: service.id,
                            startIso: slotIso,
                            client: guest,
                            payChoice: policy.allowDeposit ? choice : "full",
                            tip: quote.tip,
                            payment: {
                              method: "venmo",
                              status: "awaiting",
                              provider: "venmo",
                              reference: `venmo_${shop.venmo}`,
                            },
                          }),
                        );
                        return;
                      }
                      const result = applePayAvailable()
                        ? await startApplePay(`${APP_NAME} · ${shop.name}`, quote.dueToday)
                        : "unavailable";
                      if (result === "cancelled") {
                        setError("Apple Pay was cancelled. The chair is not held.");
                        return;
                      }
                      finish(
                        checkoutLive({
                          shopId: shop.id,
                          staffId: slotStaff,
                          serviceId: service.id,
                          startIso: slotIso,
                          client: guest,
                          payChoice: policy.allowDeposit ? choice : "full",
                          tip: quote.tip,
                          payment: {
                            method: "apple",
                            status: result === "paid" ? "paid" : "awaiting",
                            provider: "apple",
                            reference: `apple_${Date.now()}`,
                          },
                        }),
                      );
                      if (result !== "paid") {
                        setError("Apple Pay needs Safari on iPhone. The visit is held.");
                      }
                    } finally {
                      setBusy(false);
                    }
                  })();
                }}
                onLiveCard={(source) => {
                  if (!requireSlot() || !slotIso || !slotStaff || mode.demo) return;
                  setBusy(true);
                  const provider = mode.provider;
                  void import("@/lib/server-fns")
                    .then(({ chargeCardPayment }) =>
                      chargeCardPayment({
                        data: {
                          provider,
                          amountCents: Math.round(quote.dueToday * 100),
                          source: source.source,
                          idempotencyKey: crypto.randomUUID(),
                        },
                      }),
                    )
                    .then((charged) => {
                      if (!charged.ok) {
                        setError(charged.error);
                        return;
                      }
                      finish(
                        checkoutLive({
                          shopId: shop.id,
                          staffId: slotStaff,
                          serviceId: service.id,
                          startIso: slotIso,
                          client: client(),
                          payChoice: policy.allowDeposit ? choice : "full",
                          tip: quote.tip,
                          payment: {
                            method: "card",
                            status: "paid",
                            provider: charged.provider,
                            reference: charged.reference,
                            last4: source.last4,
                            brand: source.brand,
                          },
                        }),
                      );
                    })
                    .catch(() => setError("The card payment didn't go through."))
                    .finally(() => setBusy(false));
                }}
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
