import fs from "fs";

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const content = fs.readFileSync("wc-product-export-6-10-2026-1791275241197.csv", "utf8");
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
const headers = parseCSVLine(lines[0]);
const catIndex = headers.indexOf("Categories");

console.log("Categories index:", catIndex);

const rawCategories = new Set();
const hierarchyMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  const catString = cols[catIndex];
  if (catString) {
    const parts = catString.split(",").map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      rawCategories.add(p);
      if (p.includes(">")) {
        const [parent, child] = p.split(">").map(s => s.trim());
        if (!hierarchyMap.has(parent)) {
          hierarchyMap.set(parent, new Set());
        }
        hierarchyMap.get(parent).add(child);
      }
    }
  }
}

console.log("\n--- All Unique Raw Categories from WooCommerce Export ---");
const sortedCats = Array.from(rawCategories).sort();
sortedCats.forEach(c => console.log("- " + c));

console.log("\n--- Category Tree Structure ---");
for (const [parent, children] of hierarchyMap.entries()) {
  console.log(`📁 ${parent}`);
  for (const child of children) {
    console.log(`   ↳ 📄 ${child}`);
  }
}
