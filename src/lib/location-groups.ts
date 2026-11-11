import groups from "@/content/location-groups.json";

/**
 * Neighborhood pages grouped by state, in the client's order (homepage tabs, footer, phone menu).
 * Small on purpose: safe to use in browser components.
 */
export type LocationState = "DC" | "MD" | "VA";
export type LocationLink = { slug: string; name: string };

export const LOCATION_GROUPS = groups as Record<LocationState, LocationLink[]>;
export const LOCATION_STATES: { key: LocationState; label: string }[] = [
  { key: "DC", label: "Washington, DC" },
  { key: "MD", label: "Maryland" },
  { key: "VA", label: "Virginia" },
];
/** Every list ends with "+ More areas" pointing at the main delivery page */
export const MORE_AREAS_HREF = "/same-day-cannabis-delivery-washington-dc";
export const ALL_LOCATION_SLUGS = new Set(Object.values(LOCATION_GROUPS).flatMap((g) => g.map((a) => a.slug)));
