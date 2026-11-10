function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.ready === "1") {
      resolve();
      return;
    }
    const script = existing ?? document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.ready = "1";
      resolve();
    };
    script.onerror = () => reject(new Error("The card field couldn't load."));
    if (!existing) document.head.appendChild(script);
  });
}

export type CardSource = { source: string; last4?: string; brand?: string };

type StripeCard = { mount: (el: HTMLElement) => void; unmount: () => void };
type StripeFactory = (key: string) => {
  elements: () => { create: (kind: string) => StripeCard };
  createPaymentMethod: (args: { type: "card"; card: StripeCard }) => Promise<{
    paymentMethod?: { id: string; card?: { brand?: string; last4?: string } };
    error?: { message?: string };
  }>;
};

export async function mountStripeCard(publishableKey: string, el: HTMLElement) {
  await loadScript("https://js.stripe.com/v3/");
  const factory = (window as unknown as { Stripe?: StripeFactory }).Stripe;
  if (!factory) throw new Error("The card field couldn't load.");
  const stripe = factory(publishableKey);
  const card = stripe.elements().create("card");
  card.mount(el);
  return {
    async tokenize(): Promise<CardSource> {
      const result = await stripe.createPaymentMethod({ type: "card", card });
      if (result.error || !result.paymentMethod) {
        throw new Error(result.error?.message || "The card was declined.");
      }
      return {
        source: result.paymentMethod.id,
        last4: result.paymentMethod.card?.last4,
        brand: result.paymentMethod.card?.brand,
      };
    },
    unmount() {
      card.unmount();
    },
  };
}

type SquareCard = {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{ status: string; token?: string; errors?: Array<{ message?: string }> }>;
  destroy?: () => Promise<void>;
};

type SquarePayments = {
  payments: (applicationId: string, locationId: string) => { card: () => Promise<SquareCard> };
};

export async function mountProcessorCard(applicationId: string, locationId: string, el: HTMLElement) {
  await loadScript("https://web.squarecdn.com/v1/square.js");
  const sdk = (window as unknown as { Square?: SquarePayments }).Square;
  if (!sdk) throw new Error("The card field couldn't load.");
  el.id = el.id || "card-field";
  const card = await sdk.payments(applicationId, locationId).card();
  await card.attach(`#${el.id}`);
  return {
    async tokenize(): Promise<CardSource> {
      const result = await card.tokenize();
      if (result.status !== "OK" || !result.token) {
        throw new Error(result.errors?.[0]?.message || "The card was declined.");
      }
      return { source: result.token };
    },
    unmount() {
      void card.destroy?.();
    },
  };
}
