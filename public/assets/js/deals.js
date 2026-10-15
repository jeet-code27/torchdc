/* Torch flower deals. Shared by the browser (window.TorchDeals) and /api/order (require).
   Edit the prices here only, then run build.py so api/_deals.js gets the same copy. */
(function (root) {
  'use strict';

  var DEALS = {
    'Midshelf':        { half: { 2: 130, 3: 190, 4: 250 }, oz: { 2: 180, 3: 260, 4: 340 }, haul: 640,  wake: 60 },
    'Topshelf':        { half: { 2: 180, 3: 270, 4: 340 }, oz: { 2: 260, 3: 360, 4: 440 }, haul: 840,  wake: 80 },
    'Private Reserve': { half: { 2: 250, 3: 360, 4: 480 }, oz: { 2: 400, 3: 570, 4: 750 }, haul: 1320, wake: 120 }
  };
  // Flower weights and prices per tier. WooCommerce has one flat price per flower,
  // so the site offers these weights and /api/order charges these prices.
  // Set a tier to null to show its WooCommerce price as is.
  var WEIGHTS = {
    'Midshelf':        { '14g': 70, '1 oz': 100 },
    'Topshelf':        { '3.5g': 40, '7g': 60, '14g': 100, '1 oz': 140 },
    'Private Reserve': { '3.5g': 60, '7g': 80, '14g': 140, '1 oz': 220 }
  };
  function weightOptions(tier) {
    var w = WEIGHTS[tier];
    return w ? Object.keys(w).map(function (k) { return { label: k, price: w[k] }; }) : null;
  }
  var WAKE_HOURS = [9, 12]; // 9AM to 12PM, Washington DC time

  // Which deal unit an option is: 'h' (half ounce), 'o' (ounce) or '' (not part of a deal).
  function unitOf(label) {
    var l = String(label || '').toLowerCase().replace(/\s+/g, '');
    if (/^(14g|1\/2oz|½oz|halfounce|halfoz|0\.5oz)$/.test(l)) { return 'h'; }
    if (/^(28g|1oz|oz|ounce|1ounce)$/.test(l)) { return 'o'; }
    return '';
  }

  // Greedy grouping: use the priciest units first, groups of up to 4 (8 for the ounce haul).
  function groupSave(prices, table, haul) {
    var list = prices.slice().sort(function (a, b) { return b - a; });
    var save = 0, groups = [];
    if (haul) {
      while (list.length >= 8) {
        var eight = list.splice(0, 8), reg = eight.reduce(function (s, p) { return s + p; }, 0);
        if (reg > haul) { save += reg - haul; groups.push({ n: 8, price: haul, haul: true }); }
      }
    }
    while (list.length >= 2) {
      var k = Math.min(list.length, 4), g = list.splice(0, k), r = g.reduce(function (s, p) { return s + p; }, 0);
      if (r > table[k]) { save += r - table[k]; groups.push({ n: k, price: table[k] }); }
    }
    return { save: save, groups: groups };
  }

  function inWakeWindow(now) {
    try {
      var h = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(now || new Date()), 10) % 24;
      return h >= WAKE_HOURS[0] && h < WAKE_HOURS[1];
    } catch (e) { return false; }
  }

  // lines: [{ tier, unit ('h'|'o'|''), price, qty }]. Returns { total, items: [{ label, amount }] }.
  function compute(lines, now) {
    var byTier = {};
    lines.forEach(function (l) {
      if (!DEALS[l.tier] || !l.unit) { return; }
      var t = byTier[l.tier] || (byTier[l.tier] = { h: [], o: [] });
      for (var i = 0; i < l.qty; i++) { t[l.unit].push(Number(l.price) || 0); }
    });
    var wake = inWakeWindow(now), items = [], total = 0;
    Object.keys(byTier).forEach(function (tier) {
      var d = DEALS[tier], t = byTier[tier];
      // Half ounces: compare the Bundle Deal alone against Wake & Bake on one bag plus the Bundle Deal on the rest.
      var a = groupSave(t.h, d.half, 0), best = { save: a.save, groups: a.groups, wake: 0 };
      if (wake && t.h.length) {
        var sorted = t.h.slice().sort(function (x, y) { return y - x; });
        var first = sorted.shift(), wSave = Math.max(0, first - d.wake), b = groupSave(sorted, d.half, 0);
        if (wSave + b.save > best.save) { best = { save: wSave + b.save, groups: b.groups, wake: wSave }; }
      }
      if (best.wake > 0) { items.push({ label: 'Wake & Bake · ' + tier + ' ½ oz', amount: best.wake }); }
      if (best.save - best.wake > 0) {
        var units = best.groups.reduce(function (s, g) { return s + g.n; }, 0);
        items.push({ label: 'Bundle Deal · ' + tier + ' (' + units + ' x ½ oz)', amount: best.save - best.wake });
      }
      var o = groupSave(t.o, d.oz, d.haul);
      if (o.save > 0) {
        var big = o.groups.some(function (g) { return g.haul; });
        items.push({ label: (big ? 'Half-Pound Haul · ' : 'Stack & Save · ') + tier + ' (' + t.o.length + ' oz)', amount: o.save });
      }
    });
    items = items.filter(function (i) { return i.amount > 0; });
    items.forEach(function (i) { total += i.amount; });
    return { total: total, items: items };
  }

  // Progress toward the next Bundle Deal step for one tier (used on the product sheet and cart).
  function nextStep(tier, halfCount) {
    var d = DEALS[tier];
    if (!d) { return null; }
    var n = Math.min(halfCount, 4);
    if (n < 2) { return { n: n, title: 'Add 1 more ' + tier + ' half ounce, get both for $' + d.half[2] }; }
    if (n < 4) { return { n: n, title: 'Unlocked ' + n + ' for $' + d.half[n] + '. Add 1 more: $' + d.half[n + 1] }; }
    return { n: 4, title: 'Best deal unlocked: 4 half ounces for $' + d.half[4] };
  }

  // Progress toward the next Stack & Save / Half-Pound Haul step for one tier (ounces).
  function nextStepOz(tier, ozCount) {
    var d = DEALS[tier];
    if (!d) { return null; }
    var n = ozCount;
    if (n < 2) { return { n: n, title: 'Add 1 more ' + tier + ' ounce, get 2 for $' + d.oz[2] }; }
    if (n < 4) { return { n: n, title: 'Unlocked ' + n + ' oz for $' + d.oz[n] + '. Add 1 more: $' + d.oz[n + 1] }; }
    if (n < 8) { return { n: n, title: 'Unlocked 4 oz for $' + d.oz[4] + '. Go to 8 oz for $' + d.haul + ' (Half-Pound Haul)' }; }
    return { n: n, title: 'Half-Pound Haul unlocked: 8 oz for $' + d.haul };
  }

  var api = { DEALS: DEALS, nextStepOz: nextStepOz, WEIGHTS: WEIGHTS, weightOptions: weightOptions, unitOf: unitOf, compute: compute, nextStep: nextStep, inWakeWindow: inWakeWindow };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; } else { root.TorchDeals = api; }
})(this);
