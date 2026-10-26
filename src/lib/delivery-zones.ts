/**
 * Delivery fee zones (client site api/_zones.js, Oct 24).
 * DC: free. Maryland and Virginia: $20 inside the Capital Beltway (I-495) or within NEAR_MILES of it,
 * $40 farther, and no online orders past MAX_MILES from the US Capitol (the customer is asked to text us).
 * The Beltway outline follows I-495 interchange by interchange; it is approximate (about a quarter mile),
 * which the NEAR_MILES buffer absorbs.
 */

export const NEAR_MILES = 2;
export const MAX_MILES = 25;
export const FEE_NEAR = 20;
export const FEE_FAR = 40;
const CAPITOL: [number, number] = [38.8899, -77.0091];

export type DeliveryState = "DC" | "MD" | "VA";
export type QuoteBand = "dc" | "inside" | "near" | "outer" | "far" | "other";
export type DeliveryQuote = { fee: number | null; band: QuoteBand };

// [lat, lng], clockwise from the American Legion Bridge.
const BELTWAY: [number, number][] = [
  [38.97, -77.187], [38.983, -77.172], [39.006, -77.159], [39.015, -77.12],
  [39.015, -77.1], [39.015, -77.077], [39.017, -77.043], [39.017, -77.006],
  [39.014, -76.979], [39.018, -76.933], [39.005, -76.905], [38.996, -76.882],
  [38.964, -76.857], [38.945, -76.86], [38.889, -76.846], [38.843, -76.862],
  [38.818, -76.88], [38.795, -77.0], [38.793, -77.038], [38.796, -77.07],
  [38.8, -77.128], [38.781, -77.183], [38.82, -77.224], [38.866, -77.228],
  [38.881, -77.229], [38.916, -77.224], [38.933, -77.208], [38.958, -77.197],
];

// Flat projection in miles around DC. Accurate to well under 1% at this scale.
const LAT0 = (38.9 * Math.PI) / 180;
const xy = (lat: number, lng: number): [number, number] => [lng * 69.17 * Math.cos(LAT0), lat * 69.0];

export function insideBeltway(lat: number, lng: number) {
  let c = false;
  for (let i = 0, j = BELTWAY.length - 1; i < BELTWAY.length; j = i++) {
    const [ai, oi] = BELTWAY[i];
    const [aj, oj] = BELTWAY[j];
    if (ai > lat !== aj > lat && lng < ((oj - oi) * (lat - ai)) / (aj - ai) + oi) c = !c;
  }
  return c;
}

export function milesToBeltway(lat: number, lng: number) {
  const p = xy(lat, lng);
  let best = Infinity;
  for (let i = 0; i < BELTWAY.length; i++) {
    const a = xy(...BELTWAY[i]);
    const b = xy(...BELTWAY[(i + 1) % BELTWAY.length]);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy));
  }
  return best;
}

export function milesToCapitol(lat: number, lng: number) {
  const a = xy(lat, lng);
  const b = xy(...CAPITOL);
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** Fee for a point and its state (from the address). null when the point is unknown. */
export function quoteDelivery(lat: unknown, lng: unknown, state: string): DeliveryQuote | null {
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (milesToCapitol(lat, lng) > MAX_MILES) return { fee: null, band: "far" };
  if (state === "DC") return { fee: 0, band: "dc" };
  if (state !== "MD" && state !== "VA") return { fee: null, band: "other" };
  if (insideBeltway(lat, lng)) return { fee: FEE_NEAR, band: "inside" };
  if (milesToBeltway(lat, lng) <= NEAR_MILES) return { fee: FEE_NEAR, band: "near" };
  return { fee: FEE_FAR, band: "outer" };
}
