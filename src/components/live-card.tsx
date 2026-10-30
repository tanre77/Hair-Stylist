import { useEffect, useRef, useState } from "react";
import { mountProcessorCard, mountStripeCard, type CardSource } from "@/lib/browser-card";
import { primaryClass } from "./classes";

export function LiveCard({
  provider,
  publishableKey,
  applicationId,
  locationId,
  busy,
  onSource,
}: {
  provider: "stripe" | "square";
  publishableKey?: string;
  applicationId?: string;
  locationId?: string;
  busy: boolean;
  onSource: (source: CardSource) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const pay = useRef<(() => Promise<CardSource>) | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let unmount = () => {};
    let cancelled = false;
    setReady(false);
    setError("");
    const load =
      provider === "stripe" && publishableKey
        ? mountStripeCard(publishableKey, el)
        : provider === "square" && applicationId && locationId
          ? mountProcessorCard(applicationId, locationId, el)
          : Promise.reject(new Error("Card payments are not configured."));
    void load
      .then((field) => {
        if (cancelled) {
          field.unmount();
          return;
        }
        pay.current = () => field.tokenize();
        unmount = () => field.unmount();
        setReady(true);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "The card field couldn't load.");
      });
    return () => {
      cancelled = true;
      unmount();
    };
  }, [applicationId, locationId, provider, publishableKey]);

  return (
    <div className="flex flex-col gap-3">
      <div ref={host} className="min-h-11 rounded-xl bg-paper px-3 py-3 ring-1 ring-line" />
      {error && (
        <p className="text-sm text-oxblood" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={!ready || busy}
        className={primaryClass}
        onClick={() => {
          void pay.current?.().then(onSource).catch((reason: unknown) => {
            setError(reason instanceof Error ? reason.message : "The card was declined.");
          });
        }}
      >
        Pay with card
      </button>
    </div>
  );
}
