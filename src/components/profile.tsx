import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronLeft, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  kindLabel,
  slotsFor,
  upcomingDays,
  type Stylist,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatMiles, milesBetween, useLocation } from "@/lib/geo";
import { cents, money } from "@/lib/money";
import { applePayAvailable, openVenmo, startApplePay, validVenmo } from "@/lib/payments";
import { addBooking, setClientName, useStore, type PayMethod } from "@/lib/store";

const TIPS = [
  { id: "0", label: "No tip" },
  { id: "15", label: "15%" },
  { id: "18", label: "18%" },
  { id: "20", label: "20%" },
  { id: "25", label: "25%" },
  { id: "custom", label: "Custom" },
] as const;

type TipId = (typeof TIPS)[number]["id"];

function AppleMark() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="currentColor">
      <path d="M11.18 8.42c0-1.58 1.29-2.34 1.35-2.38-.74-1.08-1.89-1.23-2.3-1.25- .98-.1-1.91.58-2.41.58-.5 0-1.26-.56-2.08-.55-1.07.02-2.06.62-2.61 1.58-1.12 1.94-.29 4.8.8 6.37.53.77 1.16 1.63 1.99 1.6.8-.03 1.1-.51 2.07-.51.96 0 1.24.51 2.08.5.86-.02 1.4-.78 1.92-1.55.61-.88.86-1.74.87-1.78-.02-.01-1.67-.64-1.68-2.61zM9.62 3.86c.44-.53.73-1.27.65-2.01-.63.03-1.39.42-1.84.95-.4.47-.76 1.22-.66 1.94.7.05 1.42-.36 1.85-.88z" />
    </svg>
  );
}

export function Profile({ stylist }: { stylist: Stylist }) {
  const store = useStore();
  const { place } = useLocation();
  const [now, setNow] = useState<Date | null>(null);
  const [serviceId, setServiceId] = useState(stylist.services[0]?.id ?? "");
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slotIso, setSlotIso] = useState<string | null>(null);
  const [tipId, setTipId] = useState<TipId>("18");
  const [customTip, setCustomTip] = useState("");
  const [name, setName] = useState(store.clientName);
  const [handle, setHandle] = useState(stylist.venmo);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [bookedId, setBookedId] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState("");

  useEffect(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    setName(store.clientName);
  }, [store.clientName]);

  useEffect(() => {
    setServiceId(stylist.services[0]?.id ?? "");
    setHandle(stylist.venmo);
    setDayKey(null);
    setSlotIso(null);
    setBookedId(null);
    setError("");
    setFallbackUrl("");
  }, [stylist]);

  const days = useMemo(() => (now ? upcomingDays(6, now) : []), [now]);

  useEffect(() => {
    if (!now) return;
    for (const day of upcomingDays(6, now)) {
      const open = slotsFor(stylist, day, now).find((slot) => !slot.taken);
      if (open) {
        setDayKey(day.toDateString());
        setSlotIso(open.iso);
        return;
      }
    }
  }, [now, stylist]);

  const service = stylist.services.find((item) => item.id === serviceId) ?? stylist.services[0];
  const activeDay = days.find((day) => day.toDateString() === dayKey) ?? null;
  const slots = now && activeDay ? slotsFor(stylist, activeDay, now) : [];
  const tip =
    tipId === "custom" ? cents(Number(customTip) || 0) : service ? cents((service.price * Number(tipId)) / 100) : 0;
  const total = service ? cents(service.price + tip) : 0;
  const miles = milesBetween(place.lat, place.lng, stylist.lat, stylist.lng);
  const appleReady = applePayAvailable();

  function payNote() {
    const base = `Hair Stylist · ${service?.name ?? "Visit"} with ${stylist.name} · tip ${money(tip)} · ${name.trim()}`;
    return note.trim() ? `${base} · ${note.trim()}` : base;
  }

  function remember(method: PayMethod, status: "awaiting" | "paid") {
    if (!service || !slotIso) return;
    const id = crypto.randomUUID();
    addBooking({
      id,
      stylistId: stylist.id,
      serviceName: service.name,
      whenIso: slotIso,
      price: service.price,
      tip,
      method,
      status,
      clientName: name.trim(),
      venmo: handle.replace(/^@/, "").trim(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
      extraTips: [],
    });
    setClientName(name.trim());
    setBookedId(id);
  }

  async function pay(method: PayMethod) {
    setError("");
    setFallbackUrl("");
    if (!service || !slotIso) {
      setError("Pick an open time first.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Add the name for the chair.");
      return;
    }
    if (tip < 0 || tip > 500) {
      setError("Tip should be between $0 and $500.");
      return;
    }
    if (method === "venmo" && !validVenmo(handle)) {
      setError("Enter a Venmo username, 3–30 letters or numbers.");
      return;
    }
    setBusy(true);
    try {
      if (method === "venmo") {
        const { url, opened } = openVenmo(handle, total, payNote());
        if (!opened) setFallbackUrl(url);
        remember("venmo", "awaiting");
        return;
      }
      const result = await startApplePay(`${stylist.shop} · ${service.name}`, total);
      if (result === "cancelled") {
        setError("Apple Pay was cancelled. Your chair is not held.");
        return;
      }
      if (result === "paid") {
        remember("apple", "paid");
        return;
      }
      remember("apple", "awaiting");
      setError("Apple Pay needs Safari on iPhone. The visit is held — pay there, or use Venmo.");
    } finally {
      setBusy(false);
    }
  }

  const booked = store.bookings.find((item) => item.id === bookedId);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="inline-flex h-11 items-center gap-1 text-sm text-stone">
        <ChevronLeft className="size-4" aria-hidden="true" />
        All chairs
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="flex flex-col gap-5">
          <img
            src={stylist.portrait}
            alt={`Portrait of ${stylist.name}`}
            className="h-96 w-full rounded-2xl object-cover object-top ring-1 ring-line"
          />
          <div>
            <p className="text-sm text-stone">
              {kindLabel(stylist.kind)} · {stylist.neighborhood}
            </p>
            <h1 className="mt-1 font-display text-4xl lg:text-5xl">{stylist.name}</h1>
            <p className="mt-2 text-lg">{stylist.shop}</p>
            <p className="mt-1 text-sm text-stone">
              {stylist.address} · {formatMiles(miles)} from {place.source === "device" ? "you" : place.label}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Star className="size-4 fill-brass text-brass" aria-hidden="true" />
                {stylist.rating.toFixed(1)} · {stylist.reviews} reviews
              </span>
              <span className="text-stone">{stylist.years} years</span>
              <span className="text-stone">{stylist.hours}</span>
            </p>
          </div>
          <p className="max-w-xl text-base">{stylist.bio}</p>
          <blockquote className="max-w-xl border-l-2 border-oxblood pl-4 text-sm text-stone">
            “{stylist.quote}”
            <footer className="mt-1 text-ink">— {stylist.quoteBy}</footer>
          </blockquote>
          <div>
            <h2 className="font-display text-2xl">Services</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {stylist.services.map((item) => {
                const on = item.id === service?.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setServiceId(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ring-1",
                        on ? "bg-cream ring-oxblood" : "bg-cream ring-line",
                      )}
                    >
                      <span>
                        <span className="block font-medium">{item.name}</span>
                        <span className="block text-sm text-stone">
                          {item.blurb} · {item.minutes} min
                        </span>
                      </span>
                      <span className="tabular-nums">{money(item.price)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <aside className="rounded-2xl bg-cream p-4 ring-1 ring-line lg:sticky lg:top-24">
          {booked ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium tracking-widest text-stone uppercase">
                {booked.status === "paid" ? "Paid" : "Held"}
              </p>
              <h2 className="font-display text-3xl">You're in {stylist.name.split(" ")[0]}'s book.</h2>
              <p className="text-sm text-stone">
                {booked.serviceName} · {format(new Date(booked.whenIso), "EEE, MMM d · h:mm a")}
              </p>
              <p className="font-display text-4xl tabular-nums">{money(booked.price + booked.tip)}</p>
              <p className="text-sm text-stone">
                {booked.method === "venmo"
                  ? "Venmo should be open with this total. Confirm the recipient, then mark the visit paid."
                  : booked.status === "paid"
                    ? "Apple Pay confirmed this visit."
                    : "Finish Apple Pay on your iPhone, or pay with Venmo from Visits."}
              </p>
              {fallbackUrl && (
                <a href={fallbackUrl} target="_blank" rel="noreferrer" className="text-sm text-oxblood underline">
                  Open the Venmo payment
                </a>
              )}
              {error && <p className="text-sm text-oxblood">{error}</p>}
              <Link
                to="/visits"
                className="inline-flex h-12 items-center justify-center rounded-full bg-oxblood text-sm font-medium text-foam"
              >
                See your visits
              </Link>
            </div>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void pay("venmo");
              }}
            >
              <div>
                <h2 className="font-display text-3xl">Book</h2>
                <p className="text-sm text-stone">Service, time, tip, then Venmo or Apple Pay.</p>
              </div>

              <div>
                <p className="text-sm font-medium">Day</p>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {days.map((day) => {
                    const closed = stylist.closedWeekdays.includes(day.getDay());
                    const on = day.toDateString() === dayKey;
                    return (
                      <button
                        key={day.toDateString()}
                        type="button"
                        onClick={() => {
                          setDayKey(day.toDateString());
                          if (!now) return;
                          const open = slotsFor(stylist, day, now).find((slot) => !slot.taken);
                          setSlotIso(open?.iso ?? null);
                        }}
                        className={cn(
                          "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-sm",
                          on ? "bg-ink text-foam" : "bg-paper text-ink ring-1 ring-line",
                          closed && !on && "opacity-60",
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
                <p className="text-sm font-medium">Time</p>
                {slots.length === 0 ? (
                  <p className="mt-2 text-sm text-stone">{now ? "Closed this day." : "Checking the book…"}</p>
                ) : (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.iso}
                        type="button"
                        disabled={slot.taken}
                        onClick={() => setSlotIso(slot.iso)}
                        className={cn(
                          "h-11 rounded-full text-sm tabular-nums",
                          slot.taken && "text-stone line-through",
                          !slot.taken && slot.iso === slotIso && "bg-oxblood text-foam",
                          !slot.taken && slot.iso !== slotIso && "bg-paper ring-1 ring-line",
                        )}
                      >
                        {slot.taken ? "Taken" : slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Tip</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {TIPS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={tipId === item.id}
                      onClick={() => setTipId(item.id)}
                      className={cn(
                        "h-11 rounded-full text-sm",
                        tipId === item.id ? "bg-ink text-foam" : "bg-paper ring-1 ring-line",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {tipId === "custom" && (
                  <label className="mt-2 block text-sm">
                    Tip amount
                    <input
                      inputMode="decimal"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      placeholder="10"
                      className="mt-1 h-11 w-full rounded-xl bg-paper px-3 ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
                    />
                  </label>
                )}
              </fieldset>

              <label className="block text-sm">
                Name for the chair
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Your name"
                  className="mt-1 h-11 w-full rounded-xl bg-paper px-3 ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
                />
              </label>

              <label className="block text-sm">
                Venmo username
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="mt-1 h-11 w-full rounded-xl bg-paper px-3 ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
                />
              </label>

              <label className="block text-sm">
                Note for {stylist.name.split(" ")[0]}
                <input
                  value={note}
                  maxLength={80}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 h-11 w-full rounded-xl bg-paper px-3 ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
                />
              </label>

              <div className="flex items-end justify-between border-t border-line pt-3">
                <div className="text-sm text-stone">
                  <p>{service ? service.name : "Service"}</p>
                  <p className="tabular-nums">
                    {service ? money(service.price) : ""} + {money(tip)} tip
                  </p>
                </div>
                <p className="font-display text-4xl tabular-nums">{money(total)}</p>
              </div>

              {error && <p className="text-sm text-oxblood">{error}</p>}
              {fallbackUrl && (
                <a href={fallbackUrl} target="_blank" rel="noreferrer" className="text-sm text-oxblood underline">
                  Popup blocked — open Venmo
                </a>
              )}

              <button
                type="submit"
                disabled={busy || !slotIso}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-oxblood text-sm font-medium text-foam disabled:opacity-50"
              >
                <span className="grid size-5 place-items-center rounded-full bg-foam text-xs font-semibold text-oxblood">
                  V
                </span>
                Pay {money(total)} with Venmo
              </button>
              <button
                type="button"
                disabled={busy || !slotIso}
                onClick={() => void pay("apple")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-foam disabled:opacity-50"
              >
                <AppleMark />
                {appleReady ? "Pay with Apple Pay" : "Apple Pay"}
              </button>
              <p className="text-xs leading-5 text-stone">
                Venmo opens with the total filled in, including the tip. Apple Pay uses the payment sheet on iPhone.
                Confirm the recipient before you send — the listed Venmo names are placeholders until a shop puts in their own.
              </p>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
