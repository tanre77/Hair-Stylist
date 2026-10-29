import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Navigation, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { kindLabel, startingPrice, STYLISTS, type Stylist } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { CITIES, formatMiles, milesBetween, requestDeviceLocation, selectCity, useLocation } from "@/lib/geo";
import { money } from "@/lib/money";
import { dismissInstall, toggleSaved, useStore } from "@/lib/store";

type Filter = "all" | "barber" | "stylist" | "color" | "saved" | "near";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "barber", label: "Barbers" },
  { id: "stylist", label: "Stylists" },
  { id: "color", label: "Color" },
  { id: "near", label: "Under 8 mi" },
  { id: "saved", label: "Saved" },
];

function matches(stylist: Stylist, filter: Filter, miles: number, saved: boolean) {
  if (filter === "saved") return saved;
  if (filter === "near") return miles <= 8;
  if (filter === "barber") return stylist.kind === "barber";
  if (filter === "stylist") return stylist.kind === "stylist" || stylist.kind === "colorist";
  if (filter === "color") return stylist.offers.includes("color");
  return true;
}

export function Discover() {
  const { place, status } = useLocation();
  const store = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"near" | "rating" | "price">("near");

  const ranked = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STYLISTS.map((stylist) => ({
      stylist,
      miles: milesBetween(place.lat, place.lng, stylist.lat, stylist.lng),
    }))
      .filter(({ stylist, miles }) => {
        const saved = store.savedIds.includes(stylist.id);
        if (!matches(stylist, filter, miles, saved)) return false;
        if (!q) return true;
        const hay = `${stylist.name} ${stylist.shop} ${stylist.neighborhood} ${stylist.kind}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (sort === "rating") return b.stylist.rating - a.stylist.rating || a.miles - b.miles;
        if (sort === "price") return startingPrice(a.stylist) - startingPrice(b.stylist);
        return a.miles - b.miles;
      });
  }, [filter, place.lat, place.lng, query, sort, store.savedIds]);

  const box = {
    minLat: 39.96,
    maxLat: 40.19,
    minLng: -83.22,
    maxLng: -82.88,
  };

  function pin(lat: number, lng: number) {
    const x = 10 + (84 * (lng - box.minLng)) / (box.maxLng - box.minLng);
    const y = 14 + (72 * (box.maxLat - lat)) / (box.maxLat - box.minLat);
    return { left: `${x}%`, top: `${y}%` };
  }

  const far = milesBetween(place.lat, place.lng, 40.1579, -83.0752) > 60;

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xl">
        <p className="text-xs font-medium tracking-widest text-stone uppercase">Central Ohio</p>
        <h1 className="mt-2 font-display text-4xl text-ink lg:text-5xl">Find a chair near you.</h1>
        <p className="mt-3 text-base text-stone">
          Barbers and stylists from Powell to the Short North. Pick a time, add a tip, then pay with Venmo or Apple Pay.
        </p>
      </div>

      <section className="rounded-2xl bg-cream p-4 ring-1 ring-line">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 text-oxblood" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">
                {place.source === "device" ? "Using this device" : `Showing ${place.label}`}
              </p>
              <p className="text-sm text-stone">
                {status === "pending" && "Asking for your location. Powell is the stand-in until you allow it."}
                {status === "ready" && place.source === "device" && "Chairs are sorted by distance from you."}
                {status === "ready" && place.source === "city" && "You picked a neighborhood. Location is still available."}
                {status === "denied" && "Location is off. Pick a neighborhood, or try again."}
                {far && place.source === "device" && " These sample chairs are in central Ohio."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => requestDeviceLocation()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-foam"
          >
            <Navigation className="size-4" aria-hidden="true" />
            Use my location
          </button>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {CITIES.map((city) => {
            const on = place.source === "city" && place.label === city.label;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => selectCity(city)}
                className={cn(
                  "h-10 shrink-0 rounded-full px-3 text-sm",
                  on ? "bg-oxblood text-foam" : "bg-paper text-ink ring-1 ring-line",
                )}
              >
                {city.label}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Map of chairs" className="relative h-56 overflow-hidden rounded-2xl bg-cream ring-1 ring-line sm:h-72">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute inset-x-6 top-1/4 border-t border-line" />
          <div className="absolute inset-x-6 top-2/4 border-t border-line" />
          <div className="absolute inset-x-6 top-3/4 border-t border-line" />
          <div className="absolute inset-y-6 left-1/4 border-l border-line" />
          <div className="absolute inset-y-6 left-2/4 border-l border-line" />
          <div className="absolute inset-y-6 left-3/4 border-l border-line" />
        </div>
        <p className="absolute top-3 left-4 text-xs font-medium tracking-widest text-stone uppercase">Around you</p>
        {STYLISTS.map((stylist) => (
          <Link
            key={stylist.id}
            to="/stylist/$id"
            params={{ id: stylist.id }}
            className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={pin(stylist.lat, stylist.lng)}
            aria-label={stylist.name}
          >
            <span className="size-3 rounded-full bg-oxblood ring-2 ring-cream" />
          </Link>
        ))}
        {place.lat >= box.minLat &&
          place.lat <= box.maxLat &&
          place.lng >= box.minLng &&
          place.lng <= box.maxLng && (
            <span
              className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={pin(place.lat, place.lng)}
            >
              <span className="size-4 rounded-full bg-brass ring-4 ring-brass/30" />
            </span>
          )}
      </section>
      <p className="-mt-3 text-xs text-stone">Brass is you. Each oxblood dot is a chair.</p>

      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Search chairs</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, shop, or neighborhood"
            className="h-12 w-full rounded-full bg-cream pr-4 pl-11 text-base ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-oxblood"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "h-10 rounded-full px-3 text-sm",
                filter === item.id ? "bg-oxblood text-foam" : "bg-cream text-ink ring-1 ring-line",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 text-sm">
          {(
            [
              ["near", "Nearest"],
              ["rating", "Top rated"],
              ["price", "Price"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSort(id)}
              className={cn("h-9 px-1", sort === id ? "text-ink underline decoration-oxblood" : "text-stone")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-2xl bg-cream px-5 py-10 text-center ring-1 ring-line">
          <p className="font-display text-2xl">No chairs match.</p>
          <p className="mt-2 text-sm text-stone">Clear the search or switch neighborhoods.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {ranked.map(({ stylist, miles }) => {
            const saved = store.savedIds.includes(stylist.id);
            return (
              <li key={stylist.id} className="relative">
                <article className="overflow-hidden rounded-2xl bg-cream ring-1 ring-line transition duration-200 hover:-translate-y-0.5">
                  <Link to="/stylist/$id" params={{ id: stylist.id }} className="block">
                    <img
                      src={stylist.portrait}
                      alt=""
                      className="h-64 w-full object-cover object-top"
                    />
                    <div className="flex flex-col gap-2 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm text-stone">
                        <span>
                          {kindLabel(stylist.kind)} · {stylist.neighborhood}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Star className="size-3.5 fill-brass text-brass" aria-hidden="true" />
                          {stylist.rating.toFixed(1)}
                        </span>
                      </div>
                      <h2 className="font-display text-3xl leading-none">{stylist.name}</h2>
                      <p className="text-sm text-stone">{stylist.shop}</p>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="tabular-nums">From {money(startingPrice(stylist))}</span>
                        <span className="rounded-full bg-paper px-2 py-1 tabular-nums text-stone">{formatMiles(miles)}</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    aria-pressed={saved}
                    aria-label={saved ? `Unsave ${stylist.name}` : `Save ${stylist.name}`}
                    onClick={() => toggleSaved(stylist.id)}
                    className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-cream text-ink"
                  >
                    <Heart className={cn("size-5", saved && "fill-oxblood text-oxblood")} />
                  </button>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {!store.installDismissed && (
        <aside className="rounded-2xl bg-ink px-4 py-4 text-foam">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">Add it to your phone</p>
              <p className="mt-1 text-sm text-foam/80">
                iPhone: Share, then Add to Home Screen. Android: browser menu, then Install app. It opens full screen like a native app.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismissInstall()}
              className="h-10 shrink-0 rounded-full px-3 text-sm text-foam"
            >
              Dismiss
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
