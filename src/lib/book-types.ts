export type ShopKind = "barbershop" | "salon";

export type Shop = {
  id: string;
  name: string;
  kind: ShopKind;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  venmo: string;
  blurb: string;
  image: string;
};

export type DayHours = { openMin: number; closeMin: number } | null;

export type Staff = {
  id: string;
  shopId: string;
  name: string;
  role: string;
  portrait: string;
  bio: string;
  /** Index 0 is Sunday. */
  weekly: DayHours[];
};

export type Service = {
  id: string;
  shopId: string;
  name: string;
  blurb: string;
  price: number;
  durationMin: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  staffIds: string[];
};

export type Client = {
  id: string;
  shopId: string;
  name: string;
  email: string;
  phone: string;
  note: string;
};

export type PayMethod = "card" | "venmo" | "apple";

export type PayProvider = "demo" | "stripe" | "square" | "venmo" | "apple";

export type Payment = {
  method: PayMethod;
  status: "paid" | "refunded" | "awaiting";
  provider: PayProvider;
  reference: string;
  amount: number;
  tip: number;
  last4?: string;
  brand?: string;
};

export type AppointmentStatus = "booked" | "cancelled" | "no_show" | "completed";

export type Appointment = {
  id: string;
  token: string;
  shopId: string;
  staffId: string;
  serviceId: string;
  clientId: string;
  serviceName: string;
  staffName: string;
  shopName: string;
  startIso: string;
  durationMin: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  price: number;
  tip: number;
  payChoice: "deposit" | "full";
  dueToday: number;
  balanceAtVisit: number;
  status: AppointmentStatus;
  payment: Payment;
  createdAt: string;
  cancelledAt?: string;
  refundAmount?: number;
  noShowFee?: number;
};

export type Block = {
  id: string;
  shopId: string;
  staffId: string;
  startIso: string;
  endIso: string;
  reason: string;
};

export type Receipt = {
  id: string;
  appointmentId: string;
  token: string;
  kind: "payment" | "refund";
  at: string;
  shopName: string;
  serviceName: string;
  staffName: string;
  clientName: string;
  whenIso: string;
  method: PayMethod;
  provider: PayProvider;
  reference: string;
  serviceAmount: number;
  tip: number;
  total: number;
  last4?: string;
  brand?: string;
  note: string;
};

export type Policy = {
  cancellationWindowHours: number;
  refundInsideWindow: boolean;
  noShowFeePercent: number;
  depositPercent: number;
  allowDeposit: boolean;
};

export type BookState = {
  shops: Shop[];
  staff: Staff[];
  services: Service[];
  clients: Client[];
  appointments: Appointment[];
  blocks: Block[];
  receipts: Receipt[];
  policies: Record<string, Policy>;
};

export const DEFAULT_POLICY: Policy = {
  cancellationWindowHours: 24,
  refundInsideWindow: true,
  noShowFeePercent: 50,
  depositPercent: 30,
  allowDeposit: true,
};
