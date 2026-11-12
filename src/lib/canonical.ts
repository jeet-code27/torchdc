/**
 * A canonical URL as the website should print it: imported values still point at torchdc.com and
 * /category/, so those are moved to torchdc.co and /product-category/. Links to other sites are dropped ("").
 */
export function siteCanonical(input: unknown): string {
  let url = String(input ?? "").trim();
  if (!url) return "";
  url = url.replace(/^https?:\/\/(www\.)?torchdc\.(com|co)(?=\/|$)/i, "https://torchdc.co");
  if (!/^(\/|https:\/\/torchdc\.co(\/|$))/.test(url)) return "";
  url = url.replace(/^(https:\/\/torchdc\.co)?\/category\//, "$1/product-category/");
  // No trailing slash (the site's URLs have none), except the homepage
  return url.replace(/([^/])\/+(?=$|[?#])/, "$1");
}

/** The canonical to store for a product or category: the one typed in (cleaned up), else its own URL. */
export function storedCanonical(input: unknown, path: string): string {
  return siteCanonical(input) || `https://torchdc.co${path}`;
}
