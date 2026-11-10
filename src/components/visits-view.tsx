import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { money } from "@/lib/money";
import { useStore } from "@/lib/store";

export function VisitsView() {
  const store = useStore();
  if (!store.ready) return <p className="text-sm text-stone">Opening the book…</p>;
  const visits = [...store.book.appointments].sort(
    (a, b) => new Date(a.startIso).getTime() - new Date(b.startIso).getTime(),
  );
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium tracking-widest text-stone uppercase">On this device</p>
        <h1 className="mt-1 font-display text-4xl">Visits</h1>
        <p className="mt-2 max-w-xl text-sm text-stone">
          Sample visits are already on the book. New ones land here with a link to move or cancel them.
        </p>
      </div>
      {visits.length === 0 ? (
        <div className="rounded-2xl bg-cream px-5 py-10 text-center ring-1 ring-line">
          <p className="font-display text-2xl">No visits yet.</p>
          <Link to="/" className="mt-3 inline-flex h-11 items-center text-oxblood">
            Find a chair
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visits.map((visit) => (
            <li key={visit.id} className="rounded-2xl bg-cream p-4 ring-1 ring-line">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-widest text-stone uppercase">
                    {visit.status === "booked"
                      ? "Booked"
                      : visit.status === "cancelled"
                        ? "Cancelled"
                        : visit.status === "no_show"
                          ? "No-show"
                          : "Completed"}
                  </p>
                  <h2 className="font-display text-2xl">{visit.serviceName}</h2>
                  <p className="text-sm text-stone">
                    {visit.shopName} · {visit.staffName}
                  </p>
                  <p className="mt-1 text-sm tabular-nums">{format(new Date(visit.startIso), "EEE, MMM d · h:mm a")}</p>
                </div>
                <p className="font-display text-2xl tabular-nums">{money(visit.dueToday)}</p>
              </div>
              <Link to="/m/$token" params={{ token: visit.token }} className="mt-3 inline-flex h-11 items-center text-sm font-medium text-oxblood">
                Receipt, reschedule, or cancel
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
