import { useSyncExternalStore } from "react";

export type Place = {
  label: string;
  lat: number;
  lng: number;
  source: "device" | "city";
};

export type LocStatus = "pending" | "ready" | "denied";

export type City = { id: string; label: string; lat: number; lng: number };

export const CITIES: City[] = [
  { id: "powell", label: "Powell", lat: 40.1579, lng: -83.0752 },
  { id: "dublin", label: "Dublin", lat: 40.0992, lng: -83.1141 },
  { id: "worthington", label: "Worthington", lat: 40.0931, lng: -83.018 },
  { id: "short-north", label: "Short North", lat: 39.9885, lng: -83.0055 },
  { id: "grandview", label: "Grandview", lat: 39.983, lng: -83.045 },
  { id: "arlington", label: "Upper Arlington", lat: 40.0273, lng: -83.0627 },
  { id: "hilliard", label: "Hilliard", lat: 40.0334, lng: -83.1582 },
  { id: "westerville", label: "Westerville", lat: 40.1262, lng: -82.9291 },
];

export const POWELL: Place = {
  label: "Powell",
  lat: 40.1579,
  lng: -83.0752,
  source: "city",
};

type Snap = { place: Place; status: LocStatus };

const INITIAL: Snap = { place: POWELL, status: "pending" };
let snap: Snap = INITIAL;
const listeners = new Set<() => void>();

function publish(next: Snap) {
  snap = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLocation() {
  return useSyncExternalStore(subscribe, () => snap, () => INITIAL);
}

let requestId = 0;

export function selectCity(city: City) {
  requestId += 1;
  publish({
    place: { label: city.label, lat: city.lat, lng: city.lng, source: "city" },
    status: snap.status === "pending" ? "denied" : snap.status,
  });
}

export function requestDeviceLocation() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    publish({ place: snap.place.source === "device" ? POWELL : snap.place, status: "denied" });
    return;
  }
  const id = ++requestId;
  publish({ place: snap.place, status: "pending" });
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      if (id !== requestId) return;
      publish({
        place: {
          label: "Your location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: "device",
        },
        status: "ready",
      });
    },
    () => {
      if (id !== requestId) return;
      publish({
        place: snap.place.source === "device" ? POWELL : snap.place,
        status: "denied",
      });
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 },
  );
}

export function milesBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 3958.7613;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatMiles(miles: number) {
  if (miles < 0.1) return "0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}
