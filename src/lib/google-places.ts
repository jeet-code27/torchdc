import { quoteDelivery, type DeliveryQuote } from "@/lib/delivery-zones";

/**
 * Google Places (New) address suggestions and details for checkout (client site api/places.js, api/place.js).
 * Needs GOOGLE_MAPS_KEY on the server (Places API (New) enabled). The key never reaches the browser.
 */

export const placesEnabled = () => Boolean(process.env.GOOGLE_MAPS_KEY);

export type AddressSuggestion = { id: string; main: string; sub: string };

export type PickedAddress = {
  address: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
  hasNumber: boolean;
  quote: DeliveryQuote | null;
};

const cleanSession = (s: string) => String(s || "").replace(/[^\w-]/g, "").slice(0, 64);

/** Street addresses in DC, Maryland and Virginia only. */
export async function suggestAddresses(q: string, session: string): Promise<AddressSuggestion[]> {
  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) return [];
  const sessionToken = cleanSession(session);
  const r = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
    body: JSON.stringify({
      input: q.slice(0, 120),
      includedRegionCodes: ["us"],
      includedPrimaryTypes: ["street_address", "premise", "subpremise"],
      locationRestriction: {
        rectangle: { low: { latitude: 38.45, longitude: -77.65 }, high: { latitude: 39.35, longitude: -76.45 } },
      },
      ...(sessionToken ? { sessionToken } : {}),
    }),
    cache: "no-store",
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || `Places ${r.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (d.suggestions || []).map((s: any) => s.placePrediction).filter(Boolean).slice(0, 5).map((p: any) => ({
    id: p.placeId,
    main: p.structuredFormat?.mainText?.text || p.text?.text || "",
    sub: (p.structuredFormat?.secondaryText?.text || "").replace(/, USA$/, ""),
  }));
}

/** Full address, state, coordinates and the delivery fee for a picked suggestion. */
export async function lookupPlace(id: string, session: string): Promise<PickedAddress | null> {
  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key || !/^[\w-]{10,300}$/.test(id || "")) return null;
  const sessionToken = cleanSession(session);
  const r = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}${sessionToken ? `?sessionToken=${encodeURIComponent(sessionToken)}` : ""}`,
    { headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "formattedAddress,location,addressComponents" }, cache: "no-store" }
  );
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || `Place ${r.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comp = (type: string): any => (d.addressComponents || []).find((c: any) => (c.types || []).includes(type)) || {};
  let state: string = comp("administrative_area_level_1").shortText || "";
  if (/district of columbia/i.test(comp("administrative_area_level_1").longText || "")) state = "DC";
  const city: string =
    comp("locality").longText || comp("sublocality").longText || comp("postal_town").longText || (state === "DC" ? "Washington" : "");
  const zip: string = comp("postal_code").longText || "";
  const num: string = comp("street_number").longText || "";
  const street = [num, comp("route").shortText || comp("route").longText || ""].filter(Boolean).join(" ");
  const lat = d.location?.latitude;
  const lng = d.location?.longitude;
  return {
    address: String(d.formattedAddress || "").replace(/, USA$/, ""),
    street,
    city,
    state,
    zip,
    lat,
    lng,
    hasNumber: Boolean(num),
    quote: quoteDelivery(lat, lng, state),
  };
}
