import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Navigation, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { CITIES, formatMiles, milesBetween, requestDeviceLocation, selectCity, useLocation } from "@/lib/geo";
import { money } from "@/lib/money";
import { servicesForShop, staffForShop, startingPrice } from "@/lib/engine";
import { dismissInstall, toggleSavedShop, useStore } from "@/lib/store";

type Filter = "all" | "barbershop" | "salon" | "saved" | "near";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "barbershop", label: "Barbers" },
  { id: "salon", label: "Salons" },
  { id: "near", label: "Under 8 mi" },
  { id: "saved", label: "Saved" },
];

export function Discover() {
  const { place, status } = useLocation();
  const store = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"near" | "rating" | "price">("near");

  const ranked = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.book.shops
      .map((shop) => ({ shop, miles: milesBetween(place.lat, place.lng, shop.lat, shop.lng) }))
      .filter(({ shop, miles }) => {
        const saved = store.savedShopIds.includes(shop.id);
        if (filter === "saved" && !saved) return false;
        if (filter === "near" && miles > 8) return false;
        if (filter === "barbershop" && shop.kind !== "barbershop") return false;
        if (filter === "salon" && shop.kind !== "salon") return false;
        if (!q) return true;
        const people = staffForShop(store.book, shop.id)
          .map((member) => member.name)
          .join(" ");
        return `${shop.name} ${shop.neighborhood} ${shop.kind} ${people}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sort === "rating") return b.shop.rating - a.shop.rating || a.miles - b.miles;
        if (sort === "price") return startingPrice(store.book, a.shop.id) - startingPrice(store.book, b.shop.id);
        return a.miles - b.miles;
      });
  }, [filter, place.lat, place.lng, query, sort, store.book, store.savedShopIds]);

  const box = { minLat: 39.96, maxLat: 40.19, minLng: -83.22, maxLng: -82.88 };

  function pin(lat: number, lng: number) {
    const x = 10 + (84 * (lng - box.minLng)) / (box.maxLng - box.minLng);
    const y = 14 + (72 * (box.maxLat - lat)) / (box.maxLat - box.minLat);
    return { left: `${x}%`, top: `${y}%` };
  }

  if (!store.ready) {
    return <p className="text-sm text-stone">Opening the book…</p>;
  }

  const far = milesBetween(place.lat, place.lng, 40.1579, -83.0752) > 60;

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xl">
        <p className="text-xs font-medium tracking-widest text-stone uppercase">Central Ohio</p>
        <h1 className="mt-2 font-display text-4xl text-ink lg:text-5xl">A chair, a time, a person.</h1>
        <p className="mt-3 text-base text-stone">
          Barbers and salons with real open slots. Pick a service, a person or the first free chair, then pay a deposit or the full visit.
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
                {status === "ready" && place.source === "device" && "Shops are sorted by distance from you."}
                {status === "ready" && place.source === "city" && "You picked a neighborhood. Location is still available."}
                {status === "denied" && "Location is off. Pick a neighborhood, or try again."}
                {far && place.source === "device" && " These sample shops are in central Ohio."}
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
        <div className="mt-4 flex flex-wrap gap-2">
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

      <section aria-label="Map of shops" className="relative h-56 overflow-hidden rounded-2xl bg-cream ring-1 ring-line sm:h-72">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute inset-x-6 top-1/4 border-t border-line" />
          <div className="absolute inset-x-6 top-2/4 border-t border-line" />
          <div className="absolute inset-x-6 top-3/4 border-t border-line" />
          <div className="absolute inset-y-6 left-1/4 border-l border-line" />
          <div className="absolute inset-y-6 left-2/4 border-l border-line" />
          <div className="absolute inset-y-6 left-3/4 border-l border-line" />
        </div>
        <p className="absolute top-3 left-4 text-xs font-medium tracking-widest text-stone uppercase">Around you</p>
        {store.book.shops.map((shop) => (
          <Link
            key={shop.id}
            to="/shop/$shopId"
            params={{ shopId: shop.id }}
            className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={pin(shop.lat, shop.lng)}
            aria-label={shop.name}
          >
            <span className="size-3 rounded-full bg-oxblood ring-2 ring-cream" />
          </Link>
        ))}
        {place.lat >= box.minLat && place.lat <= box.maxLat && place.lng >= box.minLng && place.lng <= box.maxLng && (
          <span
            className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={pin(place.lat, place.lng)}
          >
            <span className="size-4 rounded-full bg-brass ring-4 ring-brass/30" />
          </span>
        )}
      </section>
      <p className="-mt-3 text-xs text-stone">Brass is you. Each oxblood dot is a shop.</p>

      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Search shops</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-stone" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a shop, neighborhood, or person"
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
          <p className="font-display text-2xl">No shops match.</p>
          <p className="mt-2 text-sm text-stone">Clear the search or switch neighborhoods.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {ranked.map(({ shop, miles }) => {
            const saved = store.savedShopIds.includes(shop.id);
            const people = staffForShop(store.book, shop.id);
            return (
              <li key={shop.id} className="relative">
                <article className="overflow-hidden rounded-2xl bg-cream ring-1 ring-line transition duration-200 hover:-translate-y-0.5">
                  <Link to="/shop/$shopId" params={{ shopId: shop.id }} className="block">
                    <img src={shop.image} alt="" className="h-52 w-full object-cover object-top" />
                    <div className="flex flex-col gap-2 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm text-stone">
                        <span>
                          {shop.kind === "barbershop" ? "Barbershop" : "Salon"} · {shop.neighborhood}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Star className="size-3.5 fill-brass text-brass" aria-hidden="true" />
                          {shop.rating.toFixed(1)}
                        </span>
                      </div>
                      <h2 className="font-display text-3xl leading-none">{shop.name}</h2>
                      <p className="text-sm text-stone">{shop.blurb}</p>
                      <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                        <span className="tabular-nums">From {money(startingPrice(store.book, shop.id))}</span>
                        <span className="rounded-full bg-paper px-2 py-1 text-stone tabular-nums">{formatMiles(miles)}</span>
                      </div>
                      <div className="flex -space-x-2 pt-1">
                        {people.slice(0, 4).map((member) => (
                          <img
                            key={member.id}
                            src={member.portrait}
                            alt=""
                            className="size-8 rounded-full object-cover ring-2 ring-cream"
                          />
                        ))}
                        <span className="sr-only">{people.length} people</span>
                      </div>
                      <p className="text-xs text-stone">
                        {servicesForShop(store.book, shop.id).length} services · {people.length} on the book
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    aria-pressed={saved}
                    aria-label={saved ? `Unsave ${shop.name}` : `Save ${shop.name}`}
                    onClick={() => toggleSavedShop(shop.id)}
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
                iPhone: Share, then Add to Home Screen. Android: browser menu, then Install app.
              </p>
            </div>
            <button type="button" onClick={() => dismissInstall()} className="h-10 shrink-0 rounded-full px-3 text-sm text-foam">
              Dismiss
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
