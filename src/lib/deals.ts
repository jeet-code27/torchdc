/**
 * Torch Flower Deals Engine
 * 100% matched with client reference deals.js
 * Supports Bundle Deals (half ounces), Stack & Save (ounces),
 * Half-Pound Haul (8 oz), and Wake & Bake (9AM-12PM DC Time).
 */

export type FlowerTier = 'Midshelf' | 'Topshelf' | 'Exotic';

/** Order minimum after deal discounts (SETTINGS.minOrder / MIN_ORDER on the client site). */
export const MIN_ORDER = 60;
export type DealUnit = 'h' | 'o' | '';

export interface TierDeals {
  half: Record<number, number>;
  oz: Record<number, number>;
  haul: number;
  wake: number;
}

export const DEALS: Record<FlowerTier, TierDeals> = {
  Midshelf: {
    half: { 2: 130, 3: 190, 4: 250 },
    oz: { 2: 180, 3: 260, 4: 340 },
    haul: 640,
    wake: 60,
  },
  Topshelf: {
    half: { 2: 180, 3: 270, 4: 340 },
    oz: { 2: 260, 3: 360, 4: 440 },
    haul: 840,
    wake: 80,
  },
  'Exotic': {
    half: { 2: 250, 3: 360, 4: 480 },
    oz: { 2: 400, 3: 570, 4: 750 },
    haul: 1320,
    wake: 120,
  },
};

export const WEIGHTS: Record<FlowerTier, Record<string, number>> = {
  Midshelf: {
    '14g': 70,
    '1 oz': 100,
  },
  Topshelf: {
    '3.5g': 40,
    '7g': 60,
    '14g': 100,
    '1 oz': 140,
  },
  'Exotic': {
    '3.5g': 60,
    '7g': 80,
    '14g': 140,
    '1 oz': 220,
  },
};

export function normalizeTier(tier?: string | null): FlowerTier | null {
  if (!tier) return null;
  const t = tier.toLowerCase().replace(/[-_\s]+/g, '');
  if (t === 'midshelf') return 'Midshelf';
  if (t === 'topshelf') return 'Topshelf';
  // "private-reserve" is the old name of the Exotic tier (category slug and old carts/links)
  if (t === 'privatereserve' || t === 'exotic') return 'Exotic';
  return null;
}

/**
 * Flower tier from a product's category slugs (WooCommerce tier categories),
 * falling back to the product name.
 */
export function tierFromCategories(catSlugs: string[], name = ''): FlowerTier | null {
  const lowerName = name.toLowerCase();
  if (catSlugs.includes('private-reserve') || lowerName.includes('private reserve') || lowerName.includes('exotic')) {
    return 'Exotic';
  }
  if (catSlugs.includes('topshelf') || lowerName.includes('topshelf')) return 'Topshelf';
  if (catSlugs.includes('midshelf') || lowerName.includes('midshelf')) return 'Midshelf';
  return null;
}

/**
 * Price of a weight on the tier chart, or null when the weight is not sold for that tier.
 */
export function tierWeightPrice(tier: string | null | undefined, label: string | null | undefined): number | null {
  const normalized = normalizeTier(tier);
  if (!normalized || !label) return null;
  const key = Object.keys(WEIGHTS[normalized]).find(
    (k) => k.replace(/\s+/g, '').toLowerCase() === label.replace(/\s+/g, '').toLowerCase()
  );
  return key ? WEIGHTS[normalized][key] : null;
}

export function weightOptions(tier: string | FlowerTier): Array<{ label: string; price: number }> | null {
  const normalized = normalizeTier(tier);
  if (!normalized) return null;
  const w = WEIGHTS[normalized];
  return w ? Object.keys(w).map((k) => ({ label: k, price: w[k] })) : null;
}

/**
 * Flowers are sold by weight at the tier chart price (WooCommerce prices are ignored).
 * Snaps a cart line to its canonical tier name, a weight the tier sells, and the chart price.
 * Lines that are not tiered flowers are returned unchanged.
 */
export function applyTierPricing<T extends { tier?: string; weight?: string; price: number; category?: string }>(
  item: T
): T {
  const tier = normalizeTier(item.tier);
  if (!tier || (item.category && item.category !== 'flowers')) return item;
  const chart = WEIGHTS[tier];
  const labels = Object.keys(chart);
  const weight =
    labels.find((k) => k.replace(/\s+/g, '').toLowerCase() === String(item.weight || '').replace(/\s+/g, '').toLowerCase()) ||
    labels[0];
  return { ...item, tier, weight, price: chart[weight] };
}

// 9AM to 12PM, Washington DC time
const WAKE_HOURS = [9, 12];

/**
 * Identify deal unit: 'h' (half ounce / 14g), 'o' (ounce / 28g) or '' (not eligible)
 */
export function unitOf(label?: string | null): DealUnit {
  const l = String(label || '').toLowerCase().replace(/\s+/g, '');
  if (/^(14g|1\/2oz|½oz|halfounce|halfoz|0\.5oz)$/.test(l)) {
    return 'h';
  }
  if (/^(28g|1oz|oz|ounce|1ounce)$/.test(l)) {
    return 'o';
  }
  return '';
}

interface GroupResult {
  save: number;
  groups: Array<{ n: number; price: number; haul?: boolean }>;
}

/**
 * Greedy grouping: use the priciest units first, groups of up to 4 (8 for the ounce haul)
 */
function groupSave(prices: number[], table: Record<number, number>, haul = 0): GroupResult {
  const list = prices.slice().sort((a, b) => b - a);
  let save = 0;
  const groups: Array<{ n: number; price: number; haul?: boolean }> = [];

  if (haul) {
    while (list.length >= 8) {
      const eight = list.splice(0, 8);
      const reg = eight.reduce((s, p) => s + p, 0);
      if (reg > haul) {
        save += reg - haul;
        groups.push({ n: 8, price: haul, haul: true });
      }
    }
  }

  while (list.length >= 2) {
    const k = Math.min(list.length, 4);
    const g = list.splice(0, k);
    const r = g.reduce((s, p) => s + p, 0);
    if (table[k] && r > table[k]) {
      save += r - table[k];
      groups.push({ n: k, price: table[k] });
    }
  }

  return { save, groups };
}

/**
 * Check if current time in America/New_York is within 9AM - 12PM
 */
export function inWakeWindow(now?: Date): boolean {
  try {
    const h =
      parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          hour: 'numeric',
          hour12: false,
        }).format(now || new Date()),
        10
      ) % 24;
    return h >= WAKE_HOURS[0] && h < WAKE_HOURS[1];
  } catch {
    return false;
  }
}

export interface DealLineInput {
  tier?: string | null;
  unit?: DealUnit;
  price: number;
  qty: number;
}

export interface DealItem {
  label: string;
  amount: number;
}

export interface DealComputationResult {
  total: number;
  items: DealItem[];
}

/**
 * Compute all deals for line items:
 * Lines: [{ tier, unit, price, qty }]
 */
export function computeDeals(lines: DealLineInput[], now?: Date): DealComputationResult {
  const byTier: Record<FlowerTier, { h: number[]; o: number[] }> = {
    Midshelf: { h: [], o: [] },
    Topshelf: { h: [], o: [] },
    'Exotic': { h: [], o: [] },
  };

  lines.forEach((l) => {
    const normalizedTier = normalizeTier(l.tier);
    const unit = l.unit;
    if (!normalizedTier || !unit) return;

    for (let i = 0; i < l.qty; i++) {
      byTier[normalizedTier][unit].push(Number(l.price) || 0);
    }
  });

  const wake = inWakeWindow(now);
  let items: DealItem[] = [];
  let total = 0;

  (Object.keys(byTier) as FlowerTier[]).forEach((tier) => {
    const d = DEALS[tier];
    const t = byTier[tier];

    // Half ounces: compare Bundle Deal alone vs Wake & Bake on 1 bag + Bundle Deal on rest
    const a = groupSave(t.h, d.half, 0);
    const best = { save: a.save, groups: a.groups, wake: 0 };

    if (wake && t.h.length) {
      const sorted = t.h.slice().sort((x, y) => y - x);
      const first = sorted.shift() || 0;
      const wSave = Math.max(0, first - d.wake);
      const b = groupSave(sorted, d.half, 0);
      if (wSave + b.save > best.save) {
        best.save = wSave + b.save;
        best.groups = b.groups;
        best.wake = wSave;
      }
    }

    if (best.wake > 0) {
      items.push({ label: `Wake & Bake · ${tier} ½ oz`, amount: best.wake });
    }
    if (best.save - best.wake > 0) {
      const units = best.groups.reduce((s, g) => s + g.n, 0);
      items.push({
        label: `Bundle Deal · ${tier} (${units} x ½ oz)`,
        amount: best.save - best.wake,
      });
    }

    // Ounces: Stack & Save + Half-Pound Haul
    const o = groupSave(t.o, d.oz, d.haul);
    if (o.save > 0) {
      const big = o.groups.some((g) => g.haul);
      items.push({
        label: `${big ? 'Half-Pound Haul · ' : 'Stack & Save · '}${tier} (${t.o.length} oz)`,
        amount: o.save,
      });
    }
  });

  items = items.filter((i) => i.amount > 0);
  items.forEach((i) => {
    total += i.amount;
  });

  return { total, items };
}

export interface NextStepResult {
  n: number;
  title: string;
}

/**
 * Progress toward the next Bundle Deal step for one tier (used on PDP sheet & cart)
 */
export function nextStep(tierInput: string, halfCount: number): NextStepResult | null {
  const tier = normalizeTier(tierInput);
  if (!tier) return null;
  const d = DEALS[tier];
  if (!d) return null;

  const n = Math.min(halfCount, 4);
  if (n < 2) {
    return { n, title: `Add 1 more ${tier} half ounce, get both for $${d.half[2]}` };
  }
  if (n < 4) {
    return {
      n,
      title: `Unlocked ${n} for $${d.half[n]}. Add 1 more: $${d.half[n + 1]}`,
    };
  }
  return { n: 4, title: `Best deal unlocked: 4 half ounces for $${d.half[4]}` };
}

/**
 * Progress toward the next Stack & Save / Half-Pound Haul step for one tier (ounces)
 */
export function nextStepOz(tierInput: string, ozCount: number): NextStepResult | null {
  const tier = normalizeTier(tierInput);
  if (!tier) return null;
  const d = DEALS[tier];
  if (!d) return null;

  const n = ozCount;
  if (n < 2) {
    return { n, title: `Add 1 more ${tier} ounce, get 2 for $${d.oz[2]}` };
  }
  if (n < 4) {
    return {
      n,
      title: `Unlocked ${n} oz for $${d.oz[n]}. Add 1 more: $${d.oz[n + 1]}`,
    };
  }
  if (n < 8) {
    return {
      n,
      title: `Unlocked 4 oz for $${d.oz[4]}. Go to 8 oz for $${d.haul} (Half-Pound Haul)`,
    };
  }
  return { n, title: `Half-Pound Haul unlocked: 8 oz for $${d.haul}` };
}
