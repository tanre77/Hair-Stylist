import { useState } from "react";
import { TIP_PRESETS, type Quote, type TipPreset } from "@/lib/checkout";
import { cn } from "@/lib/cn";
import { money } from "@/lib/money";
import type { PaymentMode } from "@/lib/pay-config";
import { fieldClass, primaryClass, quietClass } from "./classes";
import { LiveCard } from "./live-card";

export type PayChoice = "deposit" | "full";

export function PayPanel({
  quote,
  allowDeposit,
  depositPercent,
  tipPreset,
  customTip,
  choice,
  onChoice,
  onTipPreset,
  onCustomTip,
  name,
  email,
  phone,
  onName,
  onEmail,
  onPhone,
  mode,
  busy,
  error,
  onDemoCard,
  onWallet,
  onLiveCard,
}: {
  quote: Quote;
  allowDeposit: boolean;
  depositPercent: number;
  tipPreset: TipPreset;
  customTip: string;
  choice: PayChoice;
  onChoice: (choice: PayChoice) => void;
  onTipPreset: (preset: TipPreset) => void;
  onCustomTip: (value: string) => void;
  name: string;
  email: string;
  phone: string;
  onName: (value: string) => void;
  onEmail: (value: string) => void;
  onPhone: (value: string) => void;
  mode: PaymentMode;
  busy: boolean;
  error: string;
  onDemoCard: (card: { pan: string; exp: string; cvc: string; postal: string }) => void;
  onWallet: (method: "venmo" | "apple") => void;
  onLiveCard: (source: { source: string; last4?: string; brand?: string }) => void;
}) {
  const [pan, setPan] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [postal, setPostal] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium">Pay today</p>
        {allowDeposit ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={choice === "deposit"}
              onClick={() => onChoice("deposit")}
              className={cn("h-16 rounded-2xl px-3 text-left text-sm", choice === "deposit" ? "bg-ink text-foam" : "bg-paper ring-1 ring-line")}
            >
              <span className="block font-medium">Deposit</span>
              <span className="block text-xs opacity-80">{depositPercent}% now</span>
            </button>
            <button
              type="button"
              aria-pressed={choice === "full"}
              onClick={() => onChoice("full")}
              className={cn("h-16 rounded-2xl px-3 text-left text-sm", choice === "full" ? "bg-ink text-foam" : "bg-paper ring-1 ring-line")}
            >
              <span className="block font-medium">Full visit</span>
              <span className="block text-xs opacity-80">Nothing due at the chair</span>
            </button>
          </div>
        ) : (
          <p className="mt-1 text-sm text-stone">This shop collects the full visit when you book.</p>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Tip</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TIP_PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={tipPreset === item.id}
              onClick={() => onTipPreset(item.id)}
              className={cn("h-11 rounded-full text-sm", tipPreset === item.id ? "bg-ink text-foam" : "bg-paper ring-1 ring-line")}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tipPreset === "custom" && (
          <label className="mt-2 block text-sm">
            Tip amount
            <input
              inputMode="decimal"
              value={customTip}
              onChange={(event) => onCustomTip(event.target.value)}
              placeholder="10"
              className={fieldClass}
            />
          </label>
        )}
      </fieldset>

      <label className="block text-sm">
        Name
        <input value={name} onChange={(event) => onName(event.target.value)} autoComplete="name" className={fieldClass} />
      </label>
      <label className="block text-sm">
        Email
        <input value={email} onChange={(event) => onEmail(event.target.value)} autoComplete="email" inputMode="email" className={fieldClass} />
      </label>
      <label className="block text-sm">
        Phone
        <input value={phone} onChange={(event) => onPhone(event.target.value)} autoComplete="tel" inputMode="tel" className={fieldClass} />
      </label>

      <div className="flex items-end justify-between border-t border-line pt-3">
        <div className="text-sm text-stone">
          <p className="tabular-nums">
            {money(quote.serviceDue)} {choice === "deposit" ? "deposit" : "service"} + {money(quote.tip)} tip
          </p>
          {quote.balanceAtVisit > 0 && <p className="tabular-nums">{money(quote.balanceAtVisit)} at the chair</p>}
        </div>
        <p className="font-display text-4xl tabular-nums">{money(quote.dueToday)}</p>
      </div>

      {error && (
        <p className="text-sm text-oxblood" role="alert">
          {error}
        </p>
      )}

      {mode.demo ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const snapshot = { pan, exp, cvc, postal };
            setPan("");
            setCvc("");
            onDemoCard(snapshot);
          }}
        >
          <p className="text-sm text-stone">Demo card 4242 4242 4242 4242, any future date, any code, ZIP 43065.</p>
          <label className="block text-sm">
            Card number
            <input
              inputMode="numeric"
              autoComplete="cc-number"
              value={pan}
              onChange={(event) => setPan(event.target.value)}
              className={fieldClass}
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="block text-sm">
              Exp
              <input value={exp} onChange={(event) => setExp(event.target.value)} placeholder="12/30" autoComplete="cc-exp" className={fieldClass} />
            </label>
            <label className="block text-sm">
              CVC
              <input value={cvc} onChange={(event) => setCvc(event.target.value)} autoComplete="cc-csc" className={fieldClass} />
            </label>
            <label className="block text-sm">
              ZIP
              <input value={postal} onChange={(event) => setPostal(event.target.value)} autoComplete="postal-code" className={fieldClass} />
            </label>
          </div>
          <button type="submit" disabled={busy} className={primaryClass}>
            Pay {money(quote.dueToday)} with card
          </button>
        </form>
      ) : mode.provider === "stripe" ? (
        <LiveCard provider="stripe" publishableKey={mode.publishableKey} busy={busy} onSource={onLiveCard} />
      ) : mode.provider === "square" ? (
        <LiveCard
          provider="square"
          applicationId={mode.applicationId}
          locationId={mode.locationId}
          busy={busy}
          onSource={onLiveCard}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={busy} onClick={() => onWallet("venmo")} className={quietClass}>
          Venmo
        </button>
        <button type="button" disabled={busy} onClick={() => onWallet("apple")} className={cn(quietClass, "bg-ink text-foam ring-0")}>
          Apple Pay
        </button>
      </div>
      <p className="text-xs leading-5 text-stone">
        {mode.demo
          ? "Demo payments confirm on this device. Nothing is sent to a bank, and the card number is discarded after it is checked."
          : "Venmo opens with the amount filled in. Apple Pay uses the payment sheet on iPhone. Cards are handled by the processor, not stored here."}
      </p>
    </div>
  );
}
