import { quoteDelivery, type DeliveryQuote } from "@/lib/delivery-zones";

/**
 * Checkout address suggestions and delivery-fee lookup on Geoapify (free plan, OpenStreetMap data).
 * Replaces Google Places from the client build. Needs GEOAPIFY_KEY on the server; the key never
 * reaches the browser.
 */

export const geoapifyEnabled = () => Boolean(process.env.GEOAPIFY_KEY);

export type AddressSuggestion = { id: string; main: string; sub: string };

export type LocatedAddress = {
  address: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  /** null when the match is too unsure to set a fee or refuse the order */
  quote: DeliveryQuote | null;
};

// Washington area box (same as the client's Google filter) and the US Capitol for ranking
const AREA = "rect:-77.65,38.45,-76.45,39.35";
const NEAR_CAPITOL = "proximity:-77.0091,38.8899";
// Matches below this are not trusted for the fee (e.g. a typo matching a street in another state)
const MIN_CONFIDENCE = 0.8;

const cleanTail = (s: string) => String(s || "").replace(/, United States( of America)?$/, "");

async function call(path: string, params: Record<string, string>) {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) return null;
  const qs = new URLSearchParams({ ...params, format: "json", lang: "en", apiKey: key });
  const r = await fetch(`https://api.geoapify.com/v1/geocode/${path}?${qs}`, { cache: "no-store" });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.message || `Geoapify ${r.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (d.results || []) as any[];
}

/** Street addresses around DC, Maryland and Virginia as the customer types. */
export async function suggestAddresses(q: string): Promise<AddressSuggestion[]> {
  const results = await call("autocomplete", { text: q.slice(0, 120), filter: AREA, bias: NEAR_CAPITOL, limit: "5" });
  return (results || [])
    .filter((r) => r.address_line1)
    .map((r) => ({ id: String(r.place_id || r.formatted), main: r.address_line1, sub: cleanTail(r.address_line2) }));
}

/**
 * Locates an address and works out its delivery fee. Used for the fee shown at checkout and again
 * by /api/checkout when the order is placed, so the browser can't change the price.
 */
export async function locateAddress(text: string): Promise<LocatedAddress | null> {
  const t = text.trim().slice(0, 200);
  if (t.length < 5) return null;
  const results = await call("search", { text: t, filter: "countrycode:us", bias: NEAR_CAPITOL, limit: "1" });
  const r = results?.[0];
  if (!r || typeof r.lat !== "number" || typeof r.lon !== "number") return null;
  const state = String(r.state_code || "").toUpperCase();
  const confident = Number(r.rank?.confidence) >= MIN_CONFIDENCE;
  // Businesses come back as "Shop name, 1400 K Street…": keep the street address only
  const street = r.housenumber && r.street ? `${r.housenumber} ${r.street}` : r.street || r.address_line1 || "";
  return {
    address: cleanTail(r.name ? r.address_line2 : r.formatted),
    street,
    city: r.city || (state === "DC" ? "Washington" : ""),
    state,
    zip: r.postcode || "",
    lat: r.lat,
    lng: r.lon,
    quote: confident ? quoteDelivery(r.lat, r.lon, state) : null,
  };
}
