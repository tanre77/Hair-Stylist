export function venmoPayUrl(username: string, amount: number, note: string) {
  const handle = username.replace(/^@/, "").trim();
  const params = new URLSearchParams({
    txn: "pay",
    amount: amount.toFixed(2),
    note: note.slice(0, 180),
  });
  return `https://venmo.com/${encodeURIComponent(handle)}?${params.toString()}`;
}

export function openVenmo(username: string, amount: number, note: string) {
  const url = venmoPayUrl(username, amount, note);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  return { url, opened: Boolean(opened) };
}

export function validVenmo(username: string) {
  return /^[A-Za-z0-9_-]{3,30}$/.test(username.replace(/^@/, "").trim());
}

type PayResult = "paid" | "cancelled" | "unavailable";

type ApplePayCtor = {
  canMakePayments: () => boolean;
};

export function applePayAvailable() {
  if (typeof window === "undefined") return false;
  const ctor = (window as unknown as { ApplePaySession?: ApplePayCtor }).ApplePaySession;
  if (!ctor) return typeof PaymentRequest !== "undefined";
  try {
    return ctor.canMakePayments();
  } catch {
    return false;
  }
}

export async function startApplePay(label: string, amount: number): Promise<PayResult> {
  if (typeof PaymentRequest === "undefined") return "unavailable";
  const methods: PaymentMethodData[] = [
    {
      supportedMethods: "https://apple.com/apple-pay",
      data: {
        version: 3,
        merchantIdentifier: "merchant.com.hairstylist.app",
        merchantCapabilities: ["supports3DS"],
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        countryCode: "US",
      },
    },
  ];
  try {
    const request = new PaymentRequest(methods, {
      total: {
        label,
        amount: { currency: "USD", value: amount.toFixed(2) },
      },
    });
    if (request.canMakePayment) {
      const can = await request.canMakePayment();
      if (!can) return "unavailable";
    }
    const response = await request.show();
    await response.complete("success");
    return "paid";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    return "unavailable";
  }
}
