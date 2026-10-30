import { format } from "date-fns";
import { useMemo, useState } from "react";
import type { DayHours, Service } from "@/lib/book-types";
import { cn } from "@/lib/cn";
import {
  policyFor,
  servicesForShop,
  staffById,
  staffForShop,
} from "@/lib/engine";
import { money } from "@/lib/money";
import {
  deleteBlock,
  resetDemoBook,
  saveBlock,
  saveClientNote,
  saveHours,
  savePolicy,
  saveService,
  setCompleted,
  setNoShow,
  useStore,
} from "@/lib/store";
import { addDays, minutesToTimeValue, startOfDay, timeValueToMinutes, weekdayLong, weekOf } from "@/lib/time";
import { useDemoMode } from "@/lib/use-demo";
import { fieldClass, primaryClass, quietClass } from "./classes";
import { LoginScreen } from "./login-screen";

const TABS = ["Calendar", "Services", "Hours", "Blocked", "Clients", "Policies"] as const;
type Tab = (typeof TABS)[number];

export function Studio() {
  const demo = useDemoMode();
  const store = useStore();
  if (!store.ready) return <p className="text-sm text-stone">Opening the book…</p>;
  if (!demo && !store.owner) return <LoginScreen demo={false} />;
  return <Desk demo={demo} />;
}

function Desk({ demo }: { demo: boolean }) {
  const store = useStore();
  const [shopId, setShopId] = useState(store.book.shops[0]?.id ?? "");
  const [tab, setTab] = useState<Tab>("Calendar");
  const shop = store.book.shops.find((item) => item.id === shopId) ?? store.book.shops[0];
  if (!shop) return <p>No shop on this device.</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-stone uppercase">
            {demo ? "Demo data" : "On this device"}
          </p>
          <h1 className="mt-1 font-display text-4xl">Studio</h1>
          <p className="mt-1 max-w-xl text-sm text-stone">
            {demo
              ? "Sample chairs, clients, and payments. Edits stay in this browser."
              : "The book on this device. Card charges use the keys configured for the shop."}
          </p>
        </div>
        {demo && (
          <button type="button" className={quietClass} onClick={() => resetDemoBook()}>
            Restore sample book
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {store.book.shops.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setShopId(item.id)}
            className={cn(
              "h-10 rounded-full px-3 text-sm",
              item.id === shop.id ? "bg-oxblood text-foam" : "bg-cream ring-1 ring-line",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "h-10 shrink-0 rounded-full px-3 text-sm",
              tab === item ? "bg-ink text-foam" : "bg-cream ring-1 ring-line",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "Calendar" && <Calendar shopId={shop.id} />}
      {tab === "Services" && <Services shopId={shop.id} />}
      {tab === "Hours" && <Hours shopId={shop.id} />}
      {tab === "Blocked" && <Blocked shopId={shop.id} />}
      {tab === "Clients" && <Clients shopId={shop.id} />}
      {tab === "Policies" && <Policies shopId={shop.id} />}
    </div>
  );
}

function Calendar({ shopId }: { shopId: string }) {
  const store = useStore();
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [mode, setMode] = useState<"day" | "week">("day");
  const [selected, setSelected] = useState<string | null>(null);
  const people = staffForShop(store.book, shopId);
  const days = mode === "week" ? weekOf(cursor) : [cursor];
  const selectedVisit = store.book.appointments.find((item) => item.id === selected);

  const inView = store.book.appointments.filter(
    (item) => item.shopId === shopId && item.status !== "cancelled" && days.some((day) => same(day, item.startIso)),
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className={quietClass} onClick={() => setCursor(addDays(cursor, mode === "week" ? -7 : -1))}>
            Back
          </button>
          <button type="button" className={quietClass} onClick={() => setCursor(startOfDay(new Date()))}>
            Today
          </button>
          <button type="button" className={quietClass} onClick={() => setCursor(addDays(cursor, mode === "week" ? 7 : 1))}>
            Next
          </button>
        </div>
        <p className="font-display text-2xl">
          {mode === "week"
            ? `${format(days[0]!, "MMM d")} – ${format(days[6]!, "MMM d")}`
            : format(cursor, "EEEE, MMM d")}
        </p>
        <div className="flex gap-2">
          {(["day", "week"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn("h-10 rounded-full px-3 text-sm capitalize", mode === item ? "bg-ink text-foam" : "bg-cream ring-1 ring-line")}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {mode === "day" ? (
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-3">
            {people.map((member) => (
              <div key={member.id} className="w-44">
                <p className="mb-2 text-sm font-medium">{member.name.split(" ")[0]}</p>
                <div className="relative h-[528px] rounded-2xl bg-cream ring-1 ring-line">
                  {Array.from({ length: 11 }, (_, hour) => (
                    <div key={hour} className="absolute inset-x-0 border-t border-line/80" style={{ top: hour * 48 }}>
                      <span className="pl-1 text-[10px] text-stone">{format(new Date(2026, 0, 1, 8 + hour), "h a")}</span>
                    </div>
                  ))}
                  {store.book.blocks
                    .filter((block) => block.staffId === member.id && same(cursor, block.startIso))
                    .map((block) => (
                      <div
                        key={block.id}
                        className="absolute inset-x-1 rounded-xl bg-paper px-2 py-1 text-xs text-stone ring-1 ring-dashed ring-line"
                        style={spanStyle(block.startIso, block.endIso)}
                      >
                        {block.reason}
                      </div>
                    ))}
                  {inView
                    .filter((item) => item.staffId === member.id)
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelected(item.id)}
                        className={cn(
                          "absolute inset-x-1 overflow-hidden rounded-xl px-2 py-1 text-left text-xs",
                          item.status === "no_show" ? "bg-brass text-ink" : "bg-oxblood text-foam",
                          selected === item.id && "ring-2 ring-ink",
                        )}
                        style={spanStyle(item.startIso, new Date(new Date(item.startIso).getTime() + item.durationMin * 60000).toISOString())}
                      >
                        <span className="block font-medium">{format(new Date(item.startIso), "h:mm")}</span>
                        <span className="block truncate">{item.serviceName}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-7 gap-2">
            {days.map((day) => {
              const items = inView
                .filter((item) => same(day, item.startIso))
                .sort((a, b) => a.startIso.localeCompare(b.startIso));
              return (
                <div key={day.toDateString()} className="rounded-2xl bg-cream p-2 ring-1 ring-line">
                  <button type="button" onClick={() => { setCursor(day); setMode("day"); }} className="text-sm font-medium">
                    {format(day, "EEE d")}
                  </button>
                  <ul className="mt-2 flex flex-col gap-1">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(item.id)}
                          className="w-full rounded-xl bg-oxblood px-2 py-1 text-left text-xs text-foam"
                        >
                          {format(new Date(item.startIso), "h:mm")} {item.staffName.split(" ")[0]}
                          <span className="block truncate">{item.serviceName}</span>
                        </button>
                      </li>
                    ))}
                    {items.length === 0 && <li className="text-xs text-stone">Open</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {selectedVisit && (
        <div className="rounded-2xl bg-cream p-4 ring-1 ring-line">
          <p className="font-medium">
            {selectedVisit.serviceName} · {selectedVisit.staffName}
          </p>
          <p className="text-sm text-stone">
            {format(new Date(selectedVisit.startIso), "EEE, MMM d · h:mm a")} · {money(selectedVisit.dueToday)} ·{" "}
            {selectedVisit.payment.status}
            {selectedVisit.payment.last4 ? ` ···· ${selectedVisit.payment.last4}` : ""}
          </p>
          {selectedVisit.status === "booked" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={quietClass} onClick={() => setCompleted(selectedVisit.id)}>
                Mark completed
              </button>
              <button type="button" className={quietClass} onClick={() => setNoShow(selectedVisit.id)}>
                Mark no-show
              </button>
            </div>
          )}
          {selectedVisit.status === "no_show" && selectedVisit.noShowFee !== undefined && (
            <p className="mt-2 text-sm">No-show fee {money(selectedVisit.noShowFee)}.</p>
          )}
        </div>
      )}
    </section>
  );
}

function spanStyle(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  const top = ((startMin - 8 * 60) / 60) * 48;
  const height = Math.max(28, ((endMin - startMin) / 60) * 48 - 4);
  return { top, height };
}

function same(day: Date, iso: string) {
  const value = new Date(iso);
  return value.getFullYear() === day.getFullYear() && value.getMonth() === day.getMonth() && value.getDate() === day.getDate();
}

function Services({ shopId }: { shopId: string }) {
  const store = useStore();
  const services = servicesForShop(store.book, shopId);
  const people = staffForShop(store.book, shopId);
  return (
    <div className="flex flex-col gap-3">
      {services.map((service) => (
        <ServiceRow key={service.id} service={service} people={people.map((member) => ({ id: member.id, name: member.name }))} />
      ))}
      <button
        type="button"
        className={primaryClass}
        onClick={() =>
          saveService({
            id: `svc_${crypto.randomUUID().slice(0, 8)}`,
            shopId,
            name: "New service",
            blurb: "Describe the visit.",
            price: 40,
            durationMin: 45,
            bufferBeforeMin: 0,
            bufferAfterMin: 10,
            staffIds: people.map((member) => member.id),
          })
        }
      >
        Add a service
      </button>
    </div>
  );
}

function ServiceRow({ service, people }: { service: Service; people: Array<{ id: string; name: string }> }) {
  const [draft, setDraft] = useState(service);
  return (
    <form
      className="grid gap-3 rounded-2xl bg-cream p-4 ring-1 ring-line sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        saveService(draft);
      }}
    >
      <label className="text-sm">
        Name
        <input className={fieldClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
      </label>
      <label className="text-sm">
        Price
        <input
          className={fieldClass}
          inputMode="decimal"
          value={draft.price}
          onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) || 0 })}
        />
      </label>
      <label className="text-sm sm:col-span-2">
        What it includes
        <input className={fieldClass} value={draft.blurb} onChange={(event) => setDraft({ ...draft, blurb: event.target.value })} />
      </label>
      <label className="text-sm">
        Duration (min)
        <input
          className={fieldClass}
          inputMode="numeric"
          value={draft.durationMin}
          onChange={(event) => setDraft({ ...draft, durationMin: Number(event.target.value) || 0 })}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">
          Buffer before
          <input
            className={fieldClass}
            inputMode="numeric"
            value={draft.bufferBeforeMin}
            onChange={(event) => setDraft({ ...draft, bufferBeforeMin: Number(event.target.value) || 0 })}
          />
        </label>
        <label className="text-sm">
          Buffer after
          <input
            className={fieldClass}
            inputMode="numeric"
            value={draft.bufferAfterMin}
            onChange={(event) => setDraft({ ...draft, bufferAfterMin: Number(event.target.value) || 0 })}
          />
        </label>
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="text-sm">Who can do it</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {people.map((member) => {
            const on = draft.staffIds.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setDraft({
                    ...draft,
                    staffIds: on ? draft.staffIds.filter((id) => id !== member.id) : [...draft.staffIds, member.id],
                  })
                }
                className={cn("h-10 rounded-full px-3 text-sm", on ? "bg-ink text-foam" : "bg-paper ring-1 ring-line")}
              >
                {member.name}
              </button>
            );
          })}
        </div>
      </fieldset>
      <button type="submit" className={primaryClass}>
        Save {money(Number(draft.price) || 0)} · {draft.durationMin} min
      </button>
    </form>
  );
}

function Hours({ shopId }: { shopId: string }) {
  const store = useStore();
  const people = staffForShop(store.book, shopId);
  return (
    <div className="flex flex-col gap-4">
      {people.map((member) => (
        <section key={member.id} className="rounded-2xl bg-cream p-4 ring-1 ring-line">
          <h2 className="font-display text-2xl">{member.name}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {member.weekly.map((day, index) => (
              <li key={weekdayLong(index)} className="grid grid-cols-2 items-center gap-2 text-sm sm:grid-cols-[6rem_auto_1fr_1fr]">
                <span>{weekdayLong(index)}</span>
                <button
                  type="button"
                  className={quietClass}
                  onClick={() => {
                    const weekly = member.weekly.map((item, i) => {
                      if (i !== index) return item;
                      return item ? null : { openMin: 9 * 60, closeMin: 18 * 60 };
                    }) as DayHours[];
                    saveHours(member.id, weekly);
                  }}
                >
                  {day ? "Open" : "Closed"}
                </button>
                <input
                  type="time"
                  disabled={!day}
                  value={day ? minutesToTimeValue(day.openMin) : "09:00"}
                  onChange={(event) => {
                    const openMin = timeValueToMinutes(event.target.value);
                    if (!day || openMin === null) return;
                    const weekly = member.weekly.slice() as DayHours[];
                    weekly[index] = { openMin, closeMin: Math.max(day.closeMin, openMin + 15) };
                    saveHours(member.id, weekly);
                  }}
                  className={fieldClass}
                />
                <input
                  type="time"
                  disabled={!day}
                  value={day ? minutesToTimeValue(day.closeMin) : "18:00"}
                  onChange={(event) => {
                    const closeMin = timeValueToMinutes(event.target.value);
                    if (!day || closeMin === null) return;
                    const weekly = member.weekly.slice() as DayHours[];
                    weekly[index] = { openMin: day.openMin, closeMin };
                    saveHours(member.id, weekly);
                  }}
                  className={fieldClass}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Blocked({ shopId }: { shopId: string }) {
  const store = useStore();
  const people = staffForShop(store.book, shopId);
  const [staffId, setStaffId] = useState(people[0]?.id ?? "");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [start, setStart] = useState("12:00");
  const [end, setEnd] = useState("13:00");
  const [reason, setReason] = useState("Lunch");
  const [error, setError] = useState("");
  const blocks = store.book.blocks.filter((block) => block.shopId === shopId);

  return (
    <div className="flex flex-col gap-4">
      <form
        className="grid gap-3 rounded-2xl bg-cream p-4 ring-1 ring-line sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const startMin = timeValueToMinutes(start);
          const endMin = timeValueToMinutes(end);
          if (startMin === null || endMin === null) return;
          const [year, month, day] = date.split("-").map(Number);
          if (!year || !month || !day) return;
          const startDate = new Date(year, month - 1, day, 0, startMin, 0, 0);
          const endDate = new Date(year, month - 1, day, 0, endMin, 0, 0);
          const result = saveBlock({
            shopId,
            staffId,
            startIso: startDate.toISOString(),
            endIso: endDate.toISOString(),
            reason,
          });
          if (!result.ok) setError(result.error);
          else setError("");
        }}
      >
        <label className="text-sm">
          Person
          <select className={fieldClass} value={staffId} onChange={(event) => setStaffId(event.target.value)}>
            {people.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Date
          <input type="date" className={fieldClass} value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="text-sm">
          Starts
          <input type="time" className={fieldClass} value={start} onChange={(event) => setStart(event.target.value)} />
        </label>
        <label className="text-sm">
          Ends
          <input type="time" className={fieldClass} value={end} onChange={(event) => setEnd(event.target.value)} />
        </label>
        <label className="text-sm sm:col-span-2">
          Reason
          <input className={fieldClass} value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
        {error && <p className="text-sm text-oxblood sm:col-span-2">{error}</p>}
        <button type="submit" className={primaryClass}>
          Block this time
        </button>
      </form>
      <ul className="flex flex-col gap-2">
        {blocks.map((block) => (
          <li key={block.id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 ring-1 ring-line">
            <div>
              <p className="font-medium">{block.reason}</p>
              <p className="text-sm text-stone">
                {staffById(store.book, block.staffId)?.name} · {format(new Date(block.startIso), "EEE, MMM d · h:mm a")} –{" "}
                {format(new Date(block.endIso), "h:mm a")}
              </p>
            </div>
            <button type="button" className="text-sm text-oxblood" onClick={() => deleteBlock(block.id)}>
              Remove
            </button>
          </li>
        ))}
        {blocks.length === 0 && <li className="text-sm text-stone">No blocked time.</li>}
      </ul>
    </div>
  );
}

function Clients({ shopId }: { shopId: string }) {
  const store = useStore();
  const [query, setQuery] = useState("");
  const clients = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.book.clients.filter((client) => {
      if (client.shopId !== shopId) return false;
      if (!q) return true;
      return `${client.name} ${client.email} ${client.phone}`.toLowerCase().includes(q);
    });
  }, [query, shopId, store.book.clients]);

  return (
    <div className="flex flex-col gap-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search clients"
        className="h-12 rounded-full bg-cream px-4 ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
      />
      <ul className="flex flex-col gap-2">
        {clients.map((client) => {
          const visits = store.book.appointments.filter((item) => item.clientId === client.id && item.status !== "cancelled");
          return (
            <li key={client.id} className="rounded-2xl bg-cream p-4 ring-1 ring-line">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-stone">
                    {client.email || "No email"} · {client.phone || "No phone"}
                  </p>
                  <p className="text-sm text-stone">{visits.length} visits</p>
                </div>
              </div>
              <label className="mt-2 block text-sm">
                Note
                <input
                  className={fieldClass}
                  value={client.note}
                  onChange={(event) => saveClientNote(client.id, event.target.value)}
                />
              </label>
            </li>
          );
        })}
        {clients.length === 0 && <li className="text-sm text-stone">No clients yet.</li>}
      </ul>
    </div>
  );
}

function Policies({ shopId }: { shopId: string }) {
  const store = useStore();
  const policy = policyFor(store.book, shopId);
  const [draft, setDraft] = useState(policy);
  return (
    <form
      className="grid max-w-xl gap-3 rounded-2xl bg-cream p-4 ring-1 ring-line"
      onSubmit={(event) => {
        event.preventDefault();
        savePolicy(shopId, draft);
      }}
    >
      <label className="text-sm">
        Cancellation window (hours)
        <input
          className={fieldClass}
          inputMode="numeric"
          value={draft.cancellationWindowHours}
          onChange={(event) => setDraft({ ...draft, cancellationWindowHours: Number(event.target.value) || 0 })}
        />
      </label>
      <label className="text-sm">
        Deposit percent
        <input
          className={fieldClass}
          inputMode="numeric"
          value={draft.depositPercent}
          onChange={(event) => setDraft({ ...draft, depositPercent: Number(event.target.value) || 0 })}
        />
      </label>
      <label className="text-sm">
        No-show fee percent
        <input
          className={fieldClass}
          inputMode="numeric"
          value={draft.noShowFeePercent}
          onChange={(event) => setDraft({ ...draft, noShowFeePercent: Number(event.target.value) || 0 })}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.allowDeposit}
          onChange={(event) => setDraft({ ...draft, allowDeposit: event.target.checked })}
        />
        Let guests pay a deposit instead of the full visit
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.refundInsideWindow}
          onChange={(event) => setDraft({ ...draft, refundInsideWindow: event.target.checked })}
        />
        Refund card, Venmo, and Apple Pay charges cancelled inside the window
      </label>
      <p className="text-sm text-stone">
        Inside the window, a paid visit is refunded. Outside it, the shop keeps the payment. A no-show records the fee on the visit.
      </p>
      <button type="submit" className={primaryClass}>
        Save policies
      </button>
    </form>
  );
}
