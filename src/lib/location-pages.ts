import data from "@/content/location-pages.json";

/**
 * Neighborhood pages, DC quadrant hubs and the hotel page, imported word for word from the client's
 * built site (scripts/import-location-pages.py). Server only: the file is large.
 */
export type LocationPage = {
  slug: string;
  kind: "area" | "hub" | "hotel";
  /** body[data-page] value from the client site (its CSS is keyed on it) */
  pageKey: string;
  name: string;
  state?: "DC" | "MD" | "VA";
  title: string;
  description: string;
  h1: string;
  /** Page HTML; <div data-slot="rail-best"> marks where the product rail goes */
  body: string;
  /** Page schema (breadcrumbs, FAQ). The sitewide business schema comes from the layout. */
  jsonLd: Record<string, unknown>[];
};

export const LOCATION_PAGES = (data as { pages: LocationPage[] }).pages;
export const LOCATION_PAGE_BY_SLUG: Record<string, LocationPage> = Object.fromEntries(
  LOCATION_PAGES.map((p) => [p.slug, p])
);
