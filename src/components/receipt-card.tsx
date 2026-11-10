import { APP_NAME } from "@/lib/brand";
import { money } from "@/lib/money";
import type { Receipt } from "@/lib/book-types";
import { format } from "date-fns";

export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <article className="rounded-2xl bg-cream p-5 ring-1 ring-line">
      <p className="text-xs font-medium tracking-widest text-stone uppercase">
        {receipt.kind === "refund" ? "Refund" : "Receipt"}
      </p>
      <h2 className="mt-1 font-display text-3xl">{APP_NAME}</h2>
      <p className="text-sm text-stone">{receipt.shopName}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-stone">Guest</dt>
          <dd>{receipt.clientName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-stone">Service</dt>
          <dd>{receipt.serviceName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-stone">With</dt>
          <dd>{receipt.staffName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-stone">When</dt>
          <dd>{format(new Date(receipt.whenIso), "EEE, MMM d · h:mm a")}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-stone">Service</dt>
          <dd className="tabular-nums">{money(receipt.serviceAmount)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-stone">Tip</dt>
          <dd className="tabular-nums">{money(receipt.tip)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-line pt-2 font-medium">
          <dt>{receipt.kind === "refund" ? "Returned" : "Paid"}</dt>
          <dd className="tabular-nums">{money(receipt.total)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-stone">
        {receipt.method === "card"
          ? `Card${receipt.brand ? ` · ${receipt.brand}` : ""}${receipt.last4 ? ` ···· ${receipt.last4}` : ""}`
          : receipt.method === "venmo"
            ? "Venmo"
            : "Apple Pay"}
        {" · "}
        {receipt.provider === "demo" ? "Demo payment" : "Card payment"}
        {" · "}
        {receipt.reference}
      </p>
      <p className="mt-2 text-sm">{receipt.note}</p>
    </article>
  );
}
