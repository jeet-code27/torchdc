/**
 * One-time fix: stored canonical URLs still point at torchdc.com (and /category/ for categories).
 * Moves them to https://torchdc.co (same rules as src/lib/canonical.ts). Links to other sites are
 * replaced with the item's own URL.
 *
 * Dry run (shows counts only):  node --env-file=.env scripts/fix-canonicals.mjs
 * Write the changes:            node --env-file=.env scripts/fix-canonicals.mjs --apply
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required (run with --env-file=.env)");
  process.exit(1);
}
const apply = process.argv.includes("--apply");

function siteCanonical(input) {
  let url = String(input ?? "").trim();
  if (!url) return "";
  url = url.replace(/^https?:\/\/(www\.)?torchdc\.(com|co)(?=\/|$)/i, "https://torchdc.co");
  if (!/^(\/|https:\/\/torchdc\.co(\/|$))/.test(url)) return "";
  url = url.replace(/^(https:\/\/torchdc\.co)?\/category\//, "$1/product-category/");
  return url.replace(/([^/])\/+(?=$|[?#])/, "$1");
}

const COLLECTIONS = [
  // [collection, own URL for a document, keep empty values empty]
  ["products", (d) => `https://torchdc.co/product/${d.slug}`, false],
  ["categories", (d) => `https://torchdc.co/product-category/${d.slug}`, false],
  // Blog posts: empty means "the post's own URL", so empty stays empty
  ["blogs", (d) => `https://torchdc.co/${d.slug}`, true],
];

await mongoose.connect(uri);
const db = mongoose.connection.db;
for (const [name, own, keepEmpty] of COLLECTIONS) {
  const docs = await db.collection(name).find({}, { projection: { slug: 1, "seo.canonicalUrl": 1 } }).toArray();
  const ops = [];
  for (const d of docs) {
    const current = d.seo?.canonicalUrl ?? "";
    if (keepEmpty && !String(current).trim()) continue;
    const next = siteCanonical(current) || own(d);
    if (next !== current) ops.push({ updateOne: { filter: { _id: d._id }, update: { $set: { "seo.canonicalUrl": next } } } });
  }
  console.log(`${name}: ${docs.length} checked, ${ops.length} to fix`);
  if (apply && ops.length) {
    const res = await db.collection(name).bulkWrite(ops);
    console.log(`  updated ${res.modifiedCount}`);
  }
}
if (!apply) console.log("Dry run. Add --apply to save the changes.");
await mongoose.disconnect();
