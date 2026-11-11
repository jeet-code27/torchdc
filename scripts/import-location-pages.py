"""
Import the client's built location pages into src/content/location-pages.json.

Source: client-reference-new/torch-site (the client's static site zip, built with their build.py).
Pages: every neighborhood page (<section class="ahero">), the 4 DC quadrant hubs (weed-delivery-*-dc.html)
and the hotel page (cannabis-delivery-to-dc-hotels.html). The neighborhood lists grouped by state come
from the homepage tabs, in the client's order.

The page HTML is kept word for word. Only links are adjusted to this site's URLs (no trailing slash,
/shop-now -> /shop, /about-us -> /about, /cannabis-faq-dc -> /faq) and the product rail becomes a slot
the Next.js page fills. The sitewide LocalBusiness schema is left out (the layout adds it).

Run from the repo root:  python scripts/import-location-pages.py [path-to-torch-site]
"""
import glob
import html
import json
import os
import re
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join("client-reference-new", "torch-site")
OUT = os.path.join("src", "content", "location-pages.json")
# FAQ, About, Terms and Privacy: plain content pages from the same zip
STATIC_OUT = os.path.join("src", "content", "static-pages.json")
STATIC_PAGES = {"cannabis-faq-dc.html": "faq", "about-us.html": "about", "terms-conditions.html": "terms", "privacy-policy.html": "privacy"}
# Names and links only, small enough for the footer, phone menu and homepage tabs (browser code)
GROUPS_OUT = os.path.join("src", "content", "location-groups.json")

# Client URLs that this site serves elsewhere (see next.config.ts redirects)
PATH_MAP = {"/shop-now": "/shop", "/about-us": "/about", "/cannabis-faq-dc": "/faq", "/product-category/flowers": "/flowers"}


def fix_href(m):
    url = m.group(2)
    if not url.startswith("/") or url.startswith("//"):
        return m.group(0)
    path, sep, rest = re.match(r"([^?#]*)([?#]?)(.*)", url).groups()
    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]
    path = PATH_MAP.get(path, path)
    return f'{m.group(1)}{path}{sep}{rest}"'


def clean_body(main):
    body = re.sub(r"^<main[^>]*>\s*", "", main.strip())
    body = re.sub(r"\s*$", "", body)
    body = re.sub(r'(href=")([^"]*)"', fix_href, body)
    # Product rail, filled by the page (best sellers, topped up to data-min)
    body = re.sub(r'<div class="rail" data-rail="best" data-min="(\d+)"></div>', r'<div class="rail" data-slot="rail-best" data-min="\1"></div>', body)
    return body.strip()


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def page_record(fname, kind):
    s = read(os.path.join(SRC, fname))
    head = s[: s.find("<body")]
    main = s[s.find("<main") : s.find("</main>")]
    title = html.unescape(re.search(r"<title>(.*?)</title>", head, re.S).group(1).strip())
    desc_m = re.search(r'<meta name="description" content="([^"]*)"', head)
    lds = []
    for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        data = json.loads(raw)
        if data.get("@type") in ("LocalBusiness", "Store"):
            continue
        lds.append(data)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", main, re.S)
    page_key = re.search(r'<body data-page="([^"]*)"', s)
    slug = os.path.splitext(os.path.basename(fname))[0]
    return {
        "slug": slug,
        "kind": kind,
        "pageKey": page_key.group(1) if page_key else kind,
        "title": title,
        "description": html.unescape(desc_m.group(1)) if desc_m else "",
        "h1": html.unescape(re.sub(r"<[^>]+>", "", h1.group(1))).strip() if h1 else "",
        "body": clean_body(main),
        "jsonLd": lds,
    }


def groups_from_home():
    s = read(os.path.join(SRC, "index.html"))
    out = {}
    for st in ("DC", "MD", "VA"):
        pane = re.search(rf'<div class="hoods__rail" data-hpane="{st}"[^>]*>(.*?)</div>', s, re.S).group(1)
        items = []
        for href, name in re.findall(r'<a href="([^"]+)">.*?<span>(.*?)</span></a>', pane, re.S):
            slug = href.strip("/")
            items.append({"slug": slug, "name": html.unescape(name)})
        out[st] = items
    return out


def main():
    pages = []
    for f in sorted(glob.glob(os.path.join(SRC, "*.html"))):
        name = os.path.basename(f)
        s = read(f)
        m = s[s.find("<main") : s.find("</main>")]
        if 'class="ahero"' in m:
            pages.append(page_record(name, "area"))
        elif name.startswith("weed-delivery-") and name.endswith("-dc.html"):
            pages.append(page_record(name, "hub"))
        elif name == "cannabis-delivery-to-dc-hotels.html":
            pages.append(page_record(name, "hotel"))

    groups = groups_from_home()
    by_slug = {p["slug"]: p for p in pages}
    for st, items in groups.items():
        for it in items:
            p = by_slug.get(it["slug"])
            if not p:
                sys.exit(f"Group link without a page: {it['slug']}")
            p["name"] = it["name"]
            p["state"] = st
    for p in pages:
        if p["kind"] == "area" and "state" not in p:
            sys.exit(f"Area page missing from the homepage groups: {p['slug']}")
        if p["kind"] != "area":
            p["name"] = p["h1"]

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"pages": pages}, f, ensure_ascii=False, indent=1)
    with open(GROUPS_OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(groups, f, ensure_ascii=False, indent=1)
    statics = {}
    for fname, key in STATIC_PAGES.items():
        rec = page_record(fname, "static")
        rec["slug"] = key
        rec["name"] = rec["h1"]
        statics[key] = rec
    with open(STATIC_OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(statics, f, ensure_ascii=False, indent=1)
    kinds = {}
    for p in pages:
        kinds[p["kind"]] = kinds.get(p["kind"], 0) + 1
    print(f"wrote {OUT}: {kinds}, groups " + ", ".join(f"{k} {len(v)}" for k, v in groups.items()))


if __name__ == "__main__":
    main()
