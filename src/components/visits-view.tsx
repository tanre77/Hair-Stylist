import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { getStylist } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { cents, money } from "@/lib/money";
import { openVenmo, startApplePay, validVenmo } from "@/lib/payments";
import {
  addExtraTip,
  cancelBooking,
  markBookingPaid,
  markTipPaid,
  useStore,
  type Booking,
  type PayMethod,
} from "@/lib/store";

const PRESETS = [5, 8, 10, 15];

function TipBox({ booking }: { booking: Booking }) {
  const stylist = getStylist(booking.stylistId);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("8");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  async function send(method: PayMethod) {
    const tip = cents(Number(amount));
    if (tip <= 0 || tip > 500) {
      setMessage("Enter a tip between $0.01 and $500.");
      return;
    }
    const handle = booking.venmo;
    if (method === "venmo" && !validVenmo(handle)) {
      setMessage("This visit has no usable Venmo username.");
      return;
    }
    const note = `Hair Stylist tip for ${stylist?.name ?? "your stylist"} · ${booking.clientName}`;
    if (method === "venmo") {
      const result = openVenmo(handle, tip, note);
      if (!result.opened) setLink(result.url);
      addExtraTip(booking.id, {
        id: crypto.randomUUID(),
        amount: tip,
        method,
        status: "awaiting",
        at: new Date().toISOString(),
      });
      setMessage("Venmo is open for the tip. Mark it paid after you send it.");
      return;
    }
    const result = await startApplePay(`Tip · ${stylist?.shop ?? "Hair Stylist"}`, tip);
    if (result === "cancelled") {
      setMessage("Apple Pay cancelled.");
      return;
    }
    addExtraTip(booking.id, {
      id: crypto.randomUUID(),
      amount: tip,
      method,
      status: result === "paid" ? "paid" : "awaiting",
      at: new Date().toISOString(),
    });
    setMessage(result === "paid" ? "Tip paid with Apple Pay." : "Apple Pay isn't available here. Try Venmo, or use Safari on iPhone.");
  }

  return (
    <div className="mt-3">
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-sm font-medium text-oxblood">
        {open ? "Close tip" : "Add a tip"}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={cn(
                  "h-10 rounded-full px-3 text-sm tabular-nums",
                  amount === String(preset) ? "bg-ink text-foam" : "bg-paper ring-1 ring-line",
                )}
              >
                {money(preset)}
              </button>
            ))}
          </div>
          <label className="text-sm">
            Custom tip
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl bg-paper px-3 ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void send("venmo")}
              className="h-11 rounded-full bg-oxblood text-sm font-medium text-foam"
            >
              Tip with Venmo
            </button>
            <button
              type="button"
              onClick={() => void send("apple")}
              className="h-11 rounded-full bg-ink text-sm font-medium text-foam"
            >
              Tip with Apple Pay
            </button>
          </div>
          {message && <p className="text-sm text-stone">{message}</p>}
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="text-sm text-oxblood underline">
              Open Venmo
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function VisitCard({ booking, past }: { booking: Booking; past: boolean }) {
  const stylist = getStylist(booking.stylistId);
  const when = new Date(booking.whenIso);
  const total = booking.price + booking.tip;

  return (
    <article className="rounded-2xl bg-cream p-4 ring-1 ring-line">
      <div className="flex gap-3">
        {stylist ? (
          <img src={stylist.portrait} alt="" className="size-16 rounded-xl object-cover object-top" />
        ) : (
          <div className="grid size-16 place-items-center rounded-xl bg-paper text-sm">{booking.stylistId}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-widest text-stone uppercase">{past ? "Past" : "Upcoming"}</p>
          <h2 className="font-display text-2xl leading-tight">{stylist?.name ?? "Chair"}</h2>
          <p className="text-sm text-stone">
            {booking.serviceName} · {Number.isNaN(when.getTime()) ? "Time TBD" : format(when, "EEE, MMM d · h:mm a")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-sm text-stone">
          {money(booking.price)} + {money(booking.tip)} tip · {booking.method === "venmo" ? "Venmo" : "Apple Pay"} ·{" "}
          {booking.status === "paid" ? "Paid" : "Awaiting payment"}
        </p>
        <p className="font-display text-3xl tabular-nums">{money(total)}</p>
      </div>
      {booking.note && <p className="mt-2 text-sm text-stone">Note: {booking.note}</p>}
      {booking.extraTips.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {booking.extraTips.map((tip) => (
            <li key={tip.id} className="flex items-center justify-between gap-2">
              <span>
                Extra tip {money(tip.amount)} · {tip.status === "paid" ? "Paid" : "Awaiting"}
              </span>
              {tip.status === "awaiting" && (
                <button type="button" className="text-oxblood" onClick={() => markTipPaid(booking.id, tip.id)}>
                  Mark paid
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {booking.status === "awaiting" && (
          <button
            type="button"
            onClick={() => markBookingPaid(booking.id)}
            className="h-11 rounded-full bg-oxblood px-4 text-sm font-medium text-foam"
          >
            I paid
          </button>
        )}
        {stylist && (
          <Link
            to="/stylist/$id"
            params={{ id: stylist.id }}
            className="inline-flex h-11 items-center rounded-full bg-paper px-4 text-sm ring-1 ring-line"
          >
            Rebook
          </Link>
        )}
        {booking.status === "awaiting" && (
          <button type="button" onClick={() => cancelBooking(booking.id)} className="h-11 px-3 text-sm text-stone">
            Cancel hold
          </button>
        )}
      </div>
      <TipBox booking={booking} />
    </article>
  );
}

export function Visits() {
  const store = useStore();
  const now = Date.now();
  const upcoming = store.bookings
    .filter((b) => new Date(b.whenIso).getTime() >= now - 60 * 60 * 1000)
    .sort((a, b) => +new Date(a.whenIso) - +new Date(b.whenIso));
  const past = store.bookings
    .filter((b) => new Date(b.whenIso).getTime() < now - 60 * 60 * 1000)
    .sort((a, b) => +new Date(b.whenIso) - +new Date(a.whenIso));

  if (store.bookings.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <p className="text-xs font-medium tracking-widest text-stone uppercase">Visits</p>
        <h1 className="mt-2 font-display text-4xl">No chairs booked yet.</h1>
        <p className="mt-3 text-stone">When you pay a stylist, the visit lands here. You can tip again after.</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-oxblood px-5 text-sm font-medium text-foam"
        >
          Find a chair
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium tracking-widest text-stone uppercase">Your book</p>
        <h1 className="mt-2 font-display text-4xl">Visits</h1>
      </div>
      {upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-stone">Coming up</h2>
          {upcoming.map((booking) => (
            <VisitCard key={booking.id} booking={booking} past={false} />
          ))}
        </section>
      )}
      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-stone">Earlier</h2>
          {past.map((booking) => (
            <VisitCard key={booking.id} booking={booking} past />
          ))}
        </section>
      )}
    </div>
  );
}
