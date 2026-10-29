export type Service = {
  id: string;
  name: string;
  minutes: number;
  price: number;
  blurb: string;
};

export type Stylist = {
  id: string;
  name: string;
  kind: "barber" | "stylist" | "colorist";
  shop: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  years: number;
  venmo: string;
  portrait: string;
  bio: string;
  quote: string;
  quoteBy: string;
  hours: string;
  closedWeekdays: number[];
  offers: Array<"cut" | "color" | "beard" | "natural">;
  services: Service[];
};

export const STYLISTS: Stylist[] = [
  {
    id: "maya",
    name: "Maya Chen",
    kind: "stylist",
    shop: "Atelier North",
    neighborhood: "Powell",
    address: "48 N Liberty St, Powell",
    lat: 40.1591,
    lng: -83.0746,
    rating: 4.9,
    reviews: 186,
    years: 11,
    venmo: "HS-AtelierNorth",
    portrait: "/portraits/maya.jpg",
    bio: "Quiet cuts with a sharp finish. Maya books longer appointments so you leave with a shape that still looks right on a Wednesday.",
    quote: "She talked me out of a trend and into a haircut I actually wear.",
    quoteBy: "Elena P.",
    hours: "Tue–Sat · 9–6",
    closedWeekdays: [0, 1],
    offers: ["cut"],
    services: [
      { id: "cut-style", name: "Cut & style", minutes: 75, price: 72, blurb: "Consult, cut, and a finish you can redo." },
      { id: "blowout", name: "Blowout", minutes: 45, price: 48, blurb: "Smooth, with movement. Not a helmet." },
      { id: "gloss-cut", name: "Gloss & cut", minutes: 90, price: 128, blurb: "Tone refresh plus a trim." },
    ],
  },
  {
    id: "andre",
    name: "Andre Brooks",
    kind: "barber",
    shop: "Brooks & Co.",
    neighborhood: "Powell",
    address: "15 E Olentangy St, Powell",
    lat: 40.1566,
    lng: -83.0719,
    rating: 4.8,
    reviews: 312,
    years: 9,
    venmo: "HS-BrooksAndCo",
    portrait: "/portraits/andre.jpg",
    bio: "Skin fades, beard lines, and a shop that runs on time. Andre keeps a straight razor for the people who want it and clippers for everyone else.",
    quote: "In and out before the coffee got cold. Line was perfect.",
    quoteBy: "Chris A.",
    hours: "Tue–Sat · 9–6",
    closedWeekdays: [0],
    offers: ["cut", "beard"],
    services: [
      { id: "fade", name: "Skin fade", minutes: 45, price: 38, blurb: "Low, mid, or high. Includes a lineup." },
      { id: "cut-beard", name: "Cut & beard", minutes: 60, price: 52, blurb: "Haircut plus a shaped beard." },
      { id: "shave", name: "Hot towel shave", minutes: 40, price: 44, blurb: "Steam, straight razor, cool towel." },
      { id: "kids", name: "Kids cut", minutes: 30, price: 26, blurb: "Ages 12 and under. Same chair, less fuss." },
    ],
  },
  {
    id: "jonah",
    name: "Jonah Hale",
    kind: "barber",
    shop: "Hale's Chair",
    neighborhood: "Powell",
    address: "140 S Liberty St, Powell",
    lat: 40.1544,
    lng: -83.0764,
    rating: 4.9,
    reviews: 241,
    years: 18,
    venmo: "HS-HalesChair",
    portrait: "/portraits/jonah.jpg",
    bio: "Classic barbering on the south end of Liberty. Jonah still does a scissor cut if you ask, and he will tell you if the fade you saved is a bad idea.",
    quote: "Eighteen years of the same chair. He remembers how I like the sideburn.",
    quoteBy: "David M.",
    hours: "Wed–Sun · 9–5",
    closedWeekdays: [1],
    offers: ["cut", "beard"],
    services: [
      { id: "classic", name: "Classic cut", minutes: 40, price: 34, blurb: "Scissor or clipper, your call." },
      { id: "beard", name: "Beard sculpt", minutes: 25, price: 22, blurb: "Shape, neckline, and oil." },
      { id: "exec", name: "Executive shave", minutes: 45, price: 46, blurb: "Full shave with a hot towel finish." },
    ],
  },
  {
    id: "lucia",
    name: "Lucia Reyes",
    kind: "colorist",
    shop: "Reyes Color Room",
    neighborhood: "Worthington",
    address: "714 High St, Worthington",
    lat: 40.0936,
    lng: -83.0176,
    rating: 5,
    reviews: 154,
    years: 8,
    venmo: "HS-ReyesColor",
    portrait: "/portraits/lucia.jpg",
    bio: "Lived-in color, not a stripe of foil. Lucia photographs your hair in daylight before she mixes anything.",
    quote: "My roots grew out and it still looked on purpose.",
    quoteBy: "Hannah S.",
    hours: "Tue–Sat · 9–6",
    closedWeekdays: [0, 1],
    offers: ["color", "cut"],
    services: [
      { id: "balayage", name: "Balayage", minutes: 180, price: 220, blurb: "Hand-painted, toned, and cut in." },
      { id: "roots", name: "Root retouch", minutes: 120, price: 140, blurb: "Regrowth only, matched to your formula." },
      { id: "gloss", name: "Gloss", minutes: 50, price: 65, blurb: "Shine and tone. No lift." },
    ],
  },
  {
    id: "priya",
    name: "Priya Shah",
    kind: "stylist",
    shop: "Priya Studio",
    neighborhood: "Grandview",
    address: "1234 Grandview Ave, Grandview Heights",
    lat: 39.9834,
    lng: -83.0456,
    rating: 4.8,
    reviews: 203,
    years: 12,
    venmo: "HS-PriyaStudio",
    portrait: "/portraits/priya.jpg",
    bio: "Precision cutting on Grandview Avenue. Priya is the person you book before a talk, a wedding, or a haircut you do not want to think about.",
    quote: "Blunt, shiny, and it dried the same way at home.",
    quoteBy: "Noah K.",
    hours: "Tue–Sat · 10–7",
    closedWeekdays: [0],
    offers: ["cut"],
    services: [
      { id: "precision", name: "Precision cut", minutes: 60, price: 78, blurb: "Dry cut finish. Bring a photo if you want." },
      { id: "blow", name: "Blowout", minutes: 45, price: 52, blurb: "Volume where you want it, none where you don't." },
      { id: "event", name: "Event style", minutes: 75, price: 95, blurb: "Up or down, set to last the night." },
    ],
  },
  {
    id: "nia",
    name: "Nia Cole",
    kind: "stylist",
    shop: "Crown & Coil",
    neighborhood: "Short North",
    address: "1281 N High St, Columbus",
    lat: 39.9904,
    lng: -83.0064,
    rating: 4.9,
    reviews: 267,
    years: 10,
    venmo: "HS-CrownAndCoil",
    portrait: "/portraits/nia.jpg",
    bio: "Silk presses, trims, and twist-outs for natural hair. Nia will not heat-style hair that isn't ready for it.",
    quote: "First silk press that didn't make me miss my curls.",
    quoteBy: "Imani R.",
    hours: "Wed–Sun · 9–6",
    closedWeekdays: [1],
    offers: ["natural", "cut"],
    services: [
      { id: "silk", name: "Silk press", minutes: 90, price: 88, blurb: "Cleanse, treat, then press. No rushing." },
      { id: "trim", name: "Trim & shape", minutes: 60, price: 64, blurb: "Dusting or a real cut. You decide with her." },
      { id: "twist", name: "Twist-out", minutes: 75, price: 72, blurb: "Set, dry, and separate." },
    ],
  },
  {
    id: "camille",
    name: "Camille Ortiz",
    kind: "stylist",
    shop: "Ortiz House",
    neighborhood: "Upper Arlington",
    address: "2100 Arlington Ave, Upper Arlington",
    lat: 40.0276,
    lng: -83.0631,
    rating: 4.7,
    reviews: 129,
    years: 7,
    venmo: "HS-OrtizHouse",
    portrait: "/portraits/camille.jpg",
    bio: "Soft color and bridal trials in a house studio off Arlington. Camille keeps the calendar small so trials don't feel like a conveyor belt.",
    quote: "The trial looked like the wedding, which is the whole point.",
    quoteBy: "Grace L.",
    hours: "Tue–Sat · 9–5",
    closedWeekdays: [0],
    offers: ["cut", "color"],
    services: [
      { id: "finish", name: "Cut & finish", minutes: 60, price: 70, blurb: "Shape plus a style you can copy." },
      { id: "gloss", name: "Color gloss", minutes: 75, price: 95, blurb: "A clear or tinted gloss over your color." },
      { id: "bridal", name: "Bridal trial", minutes: 90, price: 120, blurb: "One look, photographed, notes sent after." },
    ],
  },
  {
    id: "malik",
    name: "Malik Trent",
    kind: "barber",
    shop: "Trent Fades",
    neighborhood: "Hilliard",
    address: "3891 Main St, Hilliard",
    lat: 40.0334,
    lng: -83.1584,
    rating: 4.8,
    reviews: 198,
    years: 6,
    venmo: "HS-TrentFades",
    portrait: "/portraits/malik.jpg",
    bio: "Burst fades and clean lineups on Main Street. Malik posts the shape he cut, not a filter, and he leaves time to fix a beard that grew in uneven.",
    quote: "Burst fade, no waiting, and he fixed the patchy spot.",
    quoteBy: "Jordan W.",
    hours: "Tue–Sat · 9–6",
    closedWeekdays: [0],
    offers: ["cut", "beard"],
    services: [
      { id: "burst", name: "Burst fade", minutes: 40, price: 36, blurb: "Around the ear, blended into the top." },
      { id: "lineup", name: "Cut & lineup", minutes: 45, price: 42, blurb: "Full cut with a sharp hairline." },
      { id: "detail", name: "Beard detail", minutes: 20, price: 18, blurb: "Cheeks, neck, and a tight outline." },
    ],
  },
];

export function getStylist(id: string) {
  return STYLISTS.find((s) => s.id === id);
}

export function startingPrice(stylist: Stylist) {
  return Math.min(...stylist.services.map((s) => s.price));
}

export type Slot = { iso: string; label: string; taken: boolean };

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

function labelFor(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hr = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function slotsFor(stylist: Stylist, day: Date, now: Date): Slot[] {
  if (stylist.closedWeekdays.includes(day.getDay())) return [];
  const slots: Slot[] = [];
  for (let minutes = 9 * 60; minutes <= 17 * 60 + 15; minutes += 45) {
    const dt = new Date(day);
    dt.setHours(0, 0, 0, 0);
    dt.setMinutes(minutes);
    if (dt.getTime() <= now.getTime()) continue;
    const iso = dt.toISOString();
    slots.push({
      iso,
      label: labelFor(minutes),
      taken: hash(`${stylist.id}|${iso}`) % 5 === 0,
    });
  }
  return slots;
}

export function upcomingDays(count: number, now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

export function kindLabel(kind: Stylist["kind"]) {
  if (kind === "barber") return "Barber";
  if (kind === "colorist") return "Colorist";
  return "Stylist";
}
