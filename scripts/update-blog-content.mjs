/**
 * Content spec (Oct 25, 2026) sections 3, 4 and 8: updates blog posts stored in the database.
 *
 *  - /same-day-cannabis-delivery-washington-dc: new opening paragraph, "Torch delivery at a glance" table,
 *    3 ordering steps, "Where we deliver" (section 3) and the new meta description
 *  - /late-night-weed-delivery-in-dc and /weed-delivery-dc-order-online: new first paragraph (section 4)
 *  - /weed-delivery-to-dc-hotel: Quick answer box and "Order now" links (section 8.1)
 *  - The 5 posts the spec lists first: Quick answer box and shop links (section 8.2)
 *
 * The "Last updated" date and the "Same-day delivery in DC" link are added to every post by the website itself.
 *
 * Safe to run twice: a post that already has the change is skipped.
 * Before writing, the current version of every post it changes is saved to blog-backup-<time>.json.
 *
 * Dry run (shows what would change):  node --env-file=.env scripts/update-blog-content.mjs
 * Write the changes:                  node --env-file=.env scripts/update-blog-content.mjs --apply
 */
import fs from "node:fs";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required (run with --env-file=.env)");
  process.exit(1);
}
const apply = process.argv.includes("--apply");

const groups = JSON.parse(fs.readFileSync(new URL("../src/content/location-groups.json", import.meta.url), "utf8"));
const dcSlug = Object.fromEntries(groups.DC.map((a) => [a.name, a.slug]));

// ---- Section 3: main delivery page ----
const SAME_DAY_OPENING =
  "Torch delivers cannabis across Washington DC, Maryland and Virginia in 30 to 90 minutes, every day from 7AM to 11PM. Delivery is free in DC and starts at $20 in Maryland and Virginia. Pay cash on delivery. You must be 21+ with a valid photo ID. Order online at torchdc.co or call (202) 468-1966.";

const DC_AREAS = [
  "Downtown", "Adams Morgan", "Columbia Heights", "Brookland", "Shaw", "Logan Circle", "Capitol Hill", "Navy Yard",
  "Dupont Circle", "Petworth", "U Street", "Georgetown", "H Street", "Penn Quarter", "Woodley Park", "Foggy Bottom",
  "NoMa", "Anacostia", "Congress Heights", "Hillcrest", "Fairlawn", "Friendship Heights",
];
const areaLinks = DC_AREAS.map((n) => (dcSlug[n] ? `<a href="/${dcSlug[n]}">${n}</a>` : n));
const areaSentence = `${areaLinks.slice(0, -1).join(", ")} and ${areaLinks[areaLinks.length - 1]}.`;

const SAME_DAY_NEW = `<p>${SAME_DAY_OPENING}</p>

<h2>Torch delivery at a glance</h2>
<table>
<tbody>
<tr><th scope="row">Delivery time</th><td>30 to 90 minutes after ID verification, depending on traffic</td></tr>
<tr><th scope="row">Hours</th><td>7AM to 11PM, 7 days a week. Orders taken until 11PM.</td></tr>
<tr><th scope="row">Delivery area</th><td>All of Washington, DC, plus Maryland and Virginia up to 25 miles from DC</td></tr>
<tr><th scope="row">Delivery fee</th><td>Free in DC. Maryland and Virginia: $20 inside the Beltway or within 2 miles outside it, $40 farther out.</td></tr>
<tr><th scope="row">Payment</th><td>Cash on delivery</td></tr>
<tr><th scope="row">Age</th><td>21+ with a valid government-issued photo ID</td></tr>
<tr><th scope="row">How to order</th><td><a href="/shop">torchdc.co</a> or <a href="tel:+12024681966">(202) 468-1966</a></td></tr>
</tbody>
</table>

<h2>How to order same-day delivery in 3 steps</h2>
<ol>
<li>Pick your products online at torchdc.co, or call (202) 468-1966.</li>
<li>Verify your ID by texting us a photo of your ID and a quick selfie.</li>
<li>Get your delivery and pay your driver in cash.</li>
</ol>

<h2>Where we deliver</h2>
<h3>Washington, DC: free delivery</h3>
<p>${areaSentence}</p>
<h3>Maryland and Virginia</h3>
<table>
<thead><tr><th scope="col">Distance</th><th scope="col">Fee</th></tr></thead>
<tbody>
<tr><td>Inside the Beltway, or within 2 miles outside it</td><td>$20</td></tr>
<tr><td>Farther out, up to 25 miles from DC</td><td>$40</td></tr>
<tr><td>More than 25 miles from DC</td><td>Call or text first</td></tr>
</tbody>
</table>`;

const SAME_DAY_META =
  "Same-day cannabis delivery in Washington DC, Maryland and Virginia. 30 to 90 minutes, 7AM to 11PM daily. Free in DC, from $20 in MD and VA.";

/** Replaces the first <p>…</p> whose text starts with `starts` (and an "In This Article:" label right before it) */
function replaceParagraph(html, starts, replacement) {
  const re = new RegExp(`(<p><strong>In This Article:</strong></p>\\s*)?<p[^>]*>(?:<[^>]+>)*\\s*${starts}[\\s\\S]*?</p>`);
  if (!re.test(html)) return null;
  return html.replace(re, replacement);
}

/** The first paragraph with real text (skips empty ones like <p>&nbsp;</p>) */
function replaceFirstParagraph(html, replacement) {
  const re = /<p[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(html))) {
    const text = m[1].replace(/<[^>]+>/g, "").replace(/&nbsp;|\s/g, "");
    if (text) return html.slice(0, m.index) + replacement + html.slice(m.index + m[0].length);
  }
  return null;
}

const PLAN = [
  {
    slug: "same-day-cannabis-delivery-washington-dc",
    done: (b) => b.content.includes("Torch delivery at a glance"),
    change: (b) => {
      const content = replaceParagraph(b.content, "This guide covers everything you need to know", SAME_DAY_NEW);
      if (!content) return { error: 'opening paragraph "This guide covers everything…" not found' };
      return { set: { content, "seo.metaDescription": SAME_DAY_META, shopLinks: "all" } };
    },
  },
  {
    slug: "late-night-weed-delivery-in-dc",
    done: (b) => b.content.includes("Torch takes orders until 11PM every night"),
    change: (b) => {
      const content = replaceFirstParagraph(
        b.content,
        "<p>Torch takes orders until 11PM every night, with delivery across DC, Maryland and Virginia in 30 to 90 minutes. Free in DC.</p>"
      );
      if (!content) return { error: "no first paragraph" };
      return {
        set: {
          content,
          quickAnswer:
            "Torch takes orders until 11PM every night and delivers across DC, Maryland and Virginia in 30 to 90 minutes after your ID is verified. Delivery is free in DC and starts at $20 in Maryland and Virginia. Pay cash on delivery.",
          shopLinks: "all",
        },
      };
    },
  },
  {
    slug: "weed-delivery-dc-order-online",
    done: (b) => b.content.includes("Order online at torchdc.co in 3 steps"),
    change: (b) => {
      const content = replaceFirstParagraph(
        b.content,
        "<p>Order online at torchdc.co in 3 steps: pick your products, text us your ID, and get delivery across DC, Maryland and Virginia.</p>"
      );
      if (!content) return { error: "no first paragraph" };
      return { set: { content, shopLinks: "all" } };
    },
  },
  {
    slug: "weed-delivery-to-dc-hotel",
    done: (b) => Boolean(b.quickAnswer),
    change: () => ({
      set: {
        quickAnswer:
          "Yes. Torch delivers cannabis to hotels in Washington DC, Maryland and Virginia in 30 to 90 minutes, every day from 7AM to 11PM. Delivery is free in DC and starts at $20 in Maryland and Virginia. Pay cash on delivery. You must be 21+ with a valid photo ID.",
        shopLinks: "all",
      },
    }),
  },
  {
    slug: "best-sativa-strains",
    done: (b) => Boolean(b.quickAnswer),
    change: () => ({
      set: {
        quickAnswer:
          "Durban Poison, Jack Herer, Sour Diesel, Green Crack and Super Lemon Haze are classic sativa strains known for uplifting, energetic daytime effects. Torch delivers sativa flower across DC, Maryland and Virginia from 7AM to 11PM, free in DC. Check the menu for what's in stock today.",
        shopLinks: "flowers",
      },
    }),
  },
  {
    slug: "best-indica-strains-for-sleep",
    done: (b) => Boolean(b.quickAnswer),
    change: () => ({
      set: {
        quickAnswer:
          "Granddaddy Purple, Northern Lights, Purple Punch and Bubba Kush are indica strains people often choose to relax before bed. Torch delivers indica flower across DC, Maryland and Virginia in 30 to 90 minutes, 7AM to 11PM daily. Check the menu for what's in stock today.",
        shopLinks: "flowers",
      },
    }),
  },
  {
    slug: "best-thc-gummies-dc-2026",
    done: (b) => Boolean(b.quickAnswer),
    change: () => ({
      set: {
        quickAnswer:
          "The best THC gummies have a predictable onset and consistent dosing, so they feel the same every time. Torch delivers THC gummies and other edibles across DC, Maryland and Virginia in 30 to 90 minutes, free in DC. Start low and wait before taking more.",
        shopLinks: "edibles",
      },
    }),
  },
  {
    slug: "best-strains-for-beginners-in-washington-dc",
    done: (b) => Boolean(b.quickAnswer),
    change: () => ({
      set: {
        quickAnswer:
          "Balanced strains with moderate THC, such as Blue Dream, Gelato, Wedding Cake and Zkittlez, are good first picks for beginners. Start with a small amount, go slowly, and wait to feel the effects before having more.",
        shopLinks: "flowers",
      },
    }),
  },
];

await mongoose.connect(uri);
const blogs = mongoose.connection.db.collection("blogs");
const backup = [];
const writes = [];
for (const item of PLAN) {
  const b = await blogs.findOne({ slug: item.slug });
  if (!b) {
    console.log(`- ${item.slug}: not found, skipped`);
    continue;
  }
  if (item.done(b)) {
    console.log(`- ${item.slug}: already updated, skipped`);
    continue;
  }
  const res = item.change(b);
  if (res.error) {
    console.log(`! ${item.slug}: ${res.error}, skipped`);
    continue;
  }
  console.log(`+ ${item.slug}: will update ${Object.keys(res.set).join(", ")}`);
  backup.push({ _id: String(b._id), slug: b.slug, content: b.content, seo: b.seo || {}, quickAnswer: b.quickAnswer, shopLinks: b.shopLinks });
  writes.push({ updateOne: { filter: { _id: b._id }, update: { $set: { ...res.set, updatedAt: new Date() } } } });
}

if (apply && writes.length) {
  const file = `blog-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  fs.writeFileSync(file, JSON.stringify(backup, null, 1));
  console.log(`Backup of the old versions: ${file}`);
  const r = await blogs.bulkWrite(writes);
  console.log(`Updated ${r.modifiedCount} posts. Pages show the change within an hour (cached pages refresh hourly).`);
} else if (!apply) {
  console.log(`Dry run: ${writes.length} posts would change. Add --apply to save.`);
} else {
  console.log("Nothing to change.");
}
await mongoose.disconnect();
