/* Torch site behaviour: open status, sliders, menu, cart, deals, checkout, pop-ups, age gate.
   Pages are picked by <body data-page="...">. */
(function () {
  'use strict';

  var SETTINGS = {
    tz: 'America/New_York',
    // [open, close] in minutes after midnight, index 0 = Sunday
    hours: [[600, 1260], [420, 1380], [420, 1380], [420, 1380], [420, 1380], [420, 1380], [420, 1380]],
    pickupAvailable: false
  };
  var IMG = '/assets/img/';
  var CATS = { flowers: 'Flowers', 'pre-rolls': 'Pre-rolls', disposables: 'Disposables', concentrates: 'Concentrates', edibles: 'Edibles', mushrooms: 'Mushrooms' };
  var TIERS = { Midshelf: 'Quality picks, priced for value', Topshelf: 'Our core lineup of classics', 'Private Reserve': 'Small-batch exotics' };
  var FLAME = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5c1.2 3.6 5.5 5.6 5.5 11.2A5.5 5.5 0 0 1 6.5 13c0-2.6 1.2-4.4 2.8-5.6.2 2.2 1.2 3.4 2.6 3.4.1-3.6-1.4-6.2.1-9.3z" fill="#FF7A1F"></path><path d="M12 22a3 3 0 0 1-3-3c0-1.6 1-2.6 2-3.4.2 1 .8 1.6 1.6 1.6 0-1 .1-1.8.7-2.6C14.2 15.6 15 17 15 19a3 3 0 0 1-3 3z" fill="#FFC23D"></path></svg>';
  var CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"></path></svg>';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US'); }
  function store(key, val) {
    try {
      if (val === undefined) { return JSON.parse(localStorage.getItem(key)); }
      if (val === null) { localStorage.removeItem(key); return null; }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
    return null;
  }
  function params() { var o = {}; new URLSearchParams(location.search).forEach(function (v, k) { o[k] = v; }); return o; }
  var page = document.body.getAttribute('data-page') || '';

  /* ---------- Open-now bar ---------- */
  function fmt(mins) {
    var h = Math.floor(mins / 60), m = mins % 60, ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + (m ? ':' + (m < 10 ? '0' : '') + m : '') + ap;
  }
  function openStatus() {
    var bar = $('.openbar');
    if (!bar) { return; }
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: SETTINGS.tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var p = {}; parts.forEach(function (x) { p[x.type] = x.value; });
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
    var now = (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10);
    var today = SETTINGS.hours[day];
    var text = $('.openbar__text', bar);
    if (today && now >= today[0] && now < today[1]) {
      bar.classList.remove('is-closed');
      text.innerHTML = '<strong>Open now</strong> · Delivering until ' + fmt(today[1]);
    } else {
      bar.classList.add('is-closed');
      var next = now < today[0] ? today[0] : SETTINGS.hours[(day + 1) % 7][0];
      text.innerHTML = '<strong>Closed now</strong> · <span class="ob-long">Order ahead, we open at</span><span class="ob-short">Opens</span> ' + fmt(next) + (now < today[0] ? '' : ' tomorrow');
    }
  }

  /* ---------- Mobile menu ---------- */
  function mobileMenu() {
    var nav = $('[data-mnav]'), btn = $('[data-menu-open]');
    if (!nav || !btn) { return; }
    function set(on) {
      if (on) { nav.removeAttribute('hidden'); } else { nav.setAttribute('hidden', ''); }
      document.body.classList.toggle('mnav-on', on);
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) { var x = $('.mnav__x', nav); if (x) { x.focus(); } } else { btn.focus(); }
    }
    btn.addEventListener('click', function () { set(true); });
    $all('[data-menu-close]', nav).forEach(function (el) { el.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !nav.hasAttribute('hidden')) { set(false); } });
  }

  /* ---------- Slider ---------- */
  function sliders() {
    $all('[data-slider]').forEach(function (el) {
      var track = $('.hero__track', el), n = track.children.length, i = 0, timer;
      var dotsWrap = el.nextElementSibling && el.nextElementSibling.classList.contains('dots') ? el.nextElementSibling : null;
      function go(k) {
        i = (k + n) % n;
        track.style.transform = 'translateX(-' + (i * 100) + '%)';
        if (dotsWrap) { $all('button', dotsWrap).forEach(function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); }); }
      }
      function start() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 7500); }
      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        for (var j = 0; j < n; j++) {
          (function (k) {
            var b = document.createElement('button');
            b.type = 'button'; b.setAttribute('aria-label', 'Go to slide ' + (k + 1)); b.innerHTML = '<span></span>';
            b.addEventListener('click', function () { go(k); start(); });
            dotsWrap.appendChild(b);
          })(j);
        }
      }
      var x0 = null;
      el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      el.addEventListener('touchend', function (e) {
        if (x0 === null) { return; }
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); start(); }
        x0 = null;
      });
      go(0); start();
    });
  }

  /* ---------- Catalog ---------- */
  var catalog = {}, products = [];
  // House style: no em or en dashes in shopper-facing copy.
  function undash(t) { return t == null ? t : String(t).replace(/\s*[\u2014\u2013]\s*/g, function (m, i) { return /^\s/.test(m) && i > 0 ? ', ' : '-'; }).replace(/^,\s*/, ''); }
  function normalize(p) {
    ['name', 'meta', 'short', 'description'].forEach(function (k) { if (p[k]) { p[k] = undash(p[k]); } });
    if (!p.options || !p.options.length) { p.options = [{ label: '', price: p.price, vid: 0 }]; }
    // Flower sold by weight: expand a flat-priced tiered flower into the tier's weight options.
    var wo = window.TorchDeals && p.tier && p.cat === 'flowers' ? TorchDeals.weightOptions(p.tier) : null;
    if (wo && p.options.length === 1 && !p.options[0].vid) { p.options = wo.map(function (o) { return { label: o.label, price: o.price, vid: 0 }; }); }
    p.options.forEach(function (o) { o.unit = window.TorchDeals ? TorchDeals.unitOf(o.label) : ''; });
    p.price = Math.min.apply(null, p.options.map(function (o) { return o.price; }));
    p.from = p.options.length > 1;
    if (!p.type) { var mt = String(p.name || '').match(/\((Indica|Sativa|Hybrid)[^)]*\)/i); if (mt) { p.type = mt[0].slice(1, -1); } }
    p.effects = [].concat(p.effects || []); p.flavor = [].concat(p.flavor || []);
    return p;
  }
  // Menu: never make shoppers wait on WordPress.
  // Show the copy saved on this phone (or the menu snapshot shipped with the site) right away,
  // then refresh from the live menu in the background and save it for the next page.
  function fetchJSON(url, ms) {
    var ctl = window.AbortController ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, ms) : 0;
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      clearTimeout(t); if (!r.ok) { throw new Error(r.status); } return r.json();
    }, function (e) { clearTimeout(t); throw e; });
  }
  function setProducts(list) {
    products = (list || []).map(normalize);
    catalog = {}; products.forEach(function (p) { catalog[p.id] = p; });
    return products;
  }
  function loadProducts(onUpdate) {
    var saved = null, fresh = false;
    try { saved = JSON.parse(localStorage.getItem('torch_menu') || 'null'); } catch (e) { saved = null; }
    var hasSaved = !!(saved && saved.products && saved.products.length);
    fresh = hasSaved && Date.now() - (saved.t || 0) < 2 * 60 * 1000;
    var first = hasSaved ? Promise.resolve(setProducts(saved.products))
      : fetchJSON('/data/products.json', 10000).then(function (d) { return setProducts(d.products); })
        .catch(function () { return setProducts([]); });
    if (!fresh) {
      fetchJSON('/api/products', 60000).then(function (d) {
        if (!d.products || !d.products.length) { return; }
        try { localStorage.setItem('torch_menu', JSON.stringify({ t: Date.now(), products: d.products })); } catch (e) {}
        first.then(function () { setProducts(d.products); if (onUpdate) { onUpdate(); } });
      }).catch(function () {});
    }
    return first;
  }
  function imgOf(p) { return p.image || (IMG + (p.img || 'flower') + '.webp'); }
  function priceLabel(p) { return (p.from ? 'from ' : '') + money(p.price); }

  /* ---------- Cart: { "slug|optionIndex": qty } ---------- */
  function cart() {
    var c = store('torch_cart') || {}, out = {};
    Object.keys(c).forEach(function (k) { if (c[k] > 0) { out[k.indexOf('|') < 0 ? k + '|0' : k] = c[k]; } });
    return out;
  }
  function setCart(c) { store('torch_cart', c); renderAllCart(); }
  function addKey(key, n) {
    var c = cart(); c[key] = Math.max(0, (c[key] || 0) + n);
    if (!c[key]) { delete c[key]; }
    setCart(c);
  }
  function qtyOf(id) {
    var c = cart(), q = 0;
    Object.keys(c).forEach(function (k) { if (k.split('|')[0] === id) { q += c[k]; } });
    return q;
  }
  function lines() {
    var c = cart();
    return Object.keys(c).map(function (k) {
      var s = k.split('|'), p = catalog[s[0]], o = p && p.options[Number(s[1]) || 0];
      if (!p || !o) { return null; }
      return { key: k, p: p, o: o, qty: c[k], total: o.price * c[k] };
    }).filter(Boolean);
  }
  function totals() {
    var ls = lines(), count = 0, sub = 0;
    ls.forEach(function (l) { count += l.qty; sub += l.total; });
    var deals = window.TorchDeals ? TorchDeals.compute(ls.map(function (l) { return { tier: l.p.tier, unit: l.o.unit, price: l.o.price, qty: l.qty }; })) : { total: 0, items: [] };
    return { lines: ls, count: count, sub: sub, deals: deals, total: sub - deals.total };
  }
  function mode() { return store('torch_mode') === 'pickup' && SETTINGS.pickupAvailable ? 'pickup' : 'delivery'; }

  function renderAllCart() {
    var t = totals();
    $all('.badge').forEach(function (b) { b.textContent = t.count; b.classList.toggle('is-on', t.count > 0); });
    var bar = $('.cartbar');
    if (bar) {
      bar.classList.toggle('is-on', t.count > 0 && page !== 'cart');
      $('.cartbar__count', bar).textContent = t.count + (t.count === 1 ? ' item' : ' items') + ' · free delivery';
      $('.cartbar__total', bar).textContent = money(t.total);
    }
    $all('.add[data-id]').forEach(function (b) {
      var q = qtyOf(b.getAttribute('data-id'));
      b.textContent = q ? String(q) : '+';
      b.classList.toggle('is-in', q > 0);
    });
    renderDesktopCart(t);
    if (page === 'cart') { renderCartPage(); }
  }

  /* ---------- Product cards ---------- */
  function card(p, badge) {
    var b = '';
    if (badge === 'hot') { b = '<span class="pcard__flame" aria-label="Best seller">' + FLAME + '</span>'; }
    else if (badge === 'new') { b = '<span class="pcard__new">NEW</span>'; }
    else if (p.badge) { b = '<span class="pcard__new pcard__new--dark">' + esc(p.badge) + '</span>'; }
    return '<div class="pcard">'
      + '<div class="pcard__img"><a href="/product/' + esc(p.id) + '/" tabindex="-1" aria-hidden="true"><img src="' + esc(imgOf(p)) + '" alt="" loading="lazy"></a>' + b
      + '<button class="add" type="button" data-id="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to cart">+</button></div>'
      + '<a class="pcard__name" href="/product/' + esc(p.id) + '/">' + esc(p.name) + '</a>'
      + '<span class="pcard__meta">' + esc(p.meta || '') + '</span>'
      + '<span class="pcard__price">' + priceLabel(p) + '</span></div>';
  }
  function bestList() { return products.filter(function (p) { return p.best; }).sort(function (a, b) { return a.best - b.best; }); }
  function newList() { return products.filter(function (p) { return p.isNew; }).sort(function (a, b) { return a.isNew - b.isNew; }); }
  function rails() {
    $all('[data-rail="best"]').forEach(function (el) {
      var list = bestList(), min = +el.getAttribute('data-min') || 0;
      if (list.length < min) { list = list.concat(products.filter(function (p) { return !p.best; }).slice(0, min - list.length)); }
      el.innerHTML = list.map(function (p) { return card(p, p.best ? 'hot' : ''); }).join('');
    });
    $all('[data-rail="new"]').forEach(function (el) { el.innerHTML = newList().map(function (p) { return card(p, 'new'); }).join(''); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.add[data-id]');
    if (b) { e.preventDefault(); addKey(b.getAttribute('data-id') + '|0', 1); }
  });

  /* ---------- Desktop: homepage sections + left menu ---------- */
  function desktopSections() {
    var wrap = $('[data-dsecs]');
    if (!wrap) { return; }
    var secs = [{ id: 'best', title: 'Best Sellers', list: bestList(), badge: 'hot', href: '/shop-now/?sort=best' },
      { id: 'new', title: 'New Arrivals', list: newList(), badge: 'new', href: '/shop-now/?sort=new' }];
    Object.keys(CATS).forEach(function (k) {
      secs.push({ id: k, title: CATS[k], list: products.filter(function (p) { return p.cat === k; }), badge: '', href: k === 'flowers' ? '/flowers/' : '/product-category/' + k + '/' });
    });
    wrap.innerHTML = secs.filter(function (s) { return s.list.length; }).map(function (s) {
      return '<section class="dsec" id="' + s.id + '"><div class="sec__head"><h2>' + s.title + '</h2><a href="' + s.href + '">See all</a></div>'
        + '<div class="grid grid--3">' + s.list.slice(0, 6).map(function (p) { return card(p, s.badge); }).join('') + '</div></section>';
    }).join('');
    var links = $all('.dside__a[data-sec]');
    function mark(id) { links.forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('data-sec') === id); }); }
    mark('best');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { mark(e.target.id); } });
      }, { rootMargin: '-120px 0px -60% 0px' });
      $all('.dsec', wrap).forEach(function (s) { io.observe(s); });
    }
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var t = document.getElementById(a.getAttribute('data-sec'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); mark(t.id); }
      });
    });
  }

  /* ---------- Desktop: right-hand cart ---------- */
  function renderDesktopCart(t) {
    var el = $('[data-dcart]');
    if (!el) { return; }
    if (!t.count) {
      el.innerHTML = '<div class="dcart__empty"><strong>Your cart is empty</strong><span>Tap + on anything in the menu.</span></div>';
      return;
    }
    el.innerHTML = '<div class="dcart__lines">' + t.lines.map(function (l) {
      return '<div class="dline"><span class="dline__img"><img src="' + esc(imgOf(l.p)) + '" alt=""></span>'
        + '<span class="dline__t"><strong>' + esc(l.p.name) + '</strong><span>' + esc(l.o.label ? l.o.label + ' · ' : '') + money(l.total) + '</span></span>'
        + '<span class="mini"><button type="button" data-k="' + esc(l.key) + '" data-d="-1" aria-label="Remove one">−</button><span>' + l.qty + '</span><button type="button" data-k="' + esc(l.key) + '" data-d="1" aria-label="Add one">+</button></span></div>';
    }).join('') + '</div>'
      + '<div class="dcart__sum"><span><span>Subtotal</span><b>' + money(t.sub) + '</b></span>'
      + t.deals.items.map(function (d) { return '<span class="ok"><span>' + esc(d.label) + '</span><b>−' + money(d.amount) + '</b></span>'; }).join('')
      + '<span><span>Delivery</span><b class="ok">Free</b></span></div>'
      + '<a class="checkoutbtn" href="/cart/">CHECKOUT · ' + money(t.total) + '</a>'
      + '<span class="dcart__pay">Pay with cash at the door</span>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-k][data-d]');
    if (b) { addKey(b.getAttribute('data-k'), Number(b.getAttribute('data-d'))); }
  });

  /* ---------- Delivery / pickup toggles ---------- */
  function modeToggles() {
    function paint() {
      var m = mode();
      $all('[data-mode]').forEach(function (b) { var on = b.getAttribute('data-mode') === m; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      $all('[data-mode-note]').forEach(function (n) { n.textContent = m === 'delivery' ? 'Free delivery across DC' : 'Curbside at 1000 G St NW'; });
      if (page === 'cart') { renderCartPage(); }
    }
    $all('[data-mode="delivery"]').forEach(function (b) { b.addEventListener('click', function () { store('torch_mode', 'delivery'); paint(); }); });
    $all('[data-mode="pickup"]').forEach(function (b) { b.addEventListener('click', function () { if (SETTINGS.pickupAvailable) { store('torch_mode', 'pickup'); paint(); } }); });
    paint();
  }

  /* ---------- Tier cards (shop flower tab and flowers page) ---------- */
  function paintTiers(active) {
    $all('[data-tier]').forEach(function (b) { var on = b.getAttribute('data-tier') === active; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  function tierCounts() {
    $all('[data-tier]').forEach(function (b) {
      var n = products.filter(function (p) { return p.tier === b.getAttribute('data-tier'); }).length;
      var c = $('.tier__c', b);
      if (c && n && store('torch_live')) { c.textContent = n + (n === 1 ? ' strain' : ' strains'); }
    });
  }

  /* ---------- Shop page ---------- */
  function shopPage() {
    var q = params(), m = location.pathname.match(/product-category\/([^/]+)/);
    var state = { tab: m ? m[1] : (q.cat || 'all'), tier: q.tier || 'Topshelf', search: (q.q || '').trim(), sort: q.sort || '' };
    if (state.tab === 'flower') { state.tab = 'flowers'; }
    if (!CATS[state.tab]) { state.tab = 'all'; }
    if (q.q) { $all('input[name="q"]').forEach(function (i) { i.value = q.q; }); }
    $all('.dside__a[data-cat]').forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('data-cat') === state.tab || (state.tab === 'all' && a.getAttribute('data-cat') === state.sort)); });
    function draw() {
      $all('[data-tab]').forEach(function (b) { var on = b.getAttribute('data-tab') === state.tab; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      var isFlower = state.tab === 'flowers';
      $('[data-shop-tiers]').hidden = !isFlower;
      $('[data-tierlink]').hidden = state.tab !== 'all' || !!state.search;
      paintTiers(state.tier);
      var list = products.filter(function (p) {
        if (state.tab !== 'all' && p.cat !== state.tab) { return false; }
        if (isFlower && p.tier !== state.tier) { return false; }
        if (state.search) {
          var hay = (p.name + ' ' + p.meta + ' ' + p.type + ' ' + p.tier + ' ' + (CATS[p.cat] || '')).toLowerCase();
          return state.search.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
        }
        if (state.sort === 'best') { return p.best; }
        if (state.sort === 'new') { return p.isNew; }
        return true;
      });
      if (state.sort === 'best') { list.sort(function (a, b) { return a.best - b.best; }); }
      if (state.sort === 'new') { list.sort(function (a, b) { return a.isNew - b.isNew; }); }
      var title = state.search ? 'Results for "' + state.search + '"' : state.sort === 'best' && state.tab === 'all' ? 'Best Sellers' : state.sort === 'new' && state.tab === 'all' ? 'New Arrivals' : state.tab === 'all' ? 'Shop All' : (isFlower ? state.tier + ' Flower' : CATS[state.tab]);
      $('[data-shop-title]').textContent = title;
      $('[data-shop-count]').textContent = list.length + (list.length === 1 ? ' product' : ' products');
      $('[data-shop-grid]').innerHTML = list.length ? list.map(function (p) { return card(p, p.best && state.sort !== 'new' ? 'hot' : p.isNew && state.sort === 'new' ? 'new' : ''); }).join('')
        : '<div class="empty"><strong>Nothing here yet</strong><span>Try another category or search.</span></div>';
      renderAllCart();
      document.title = title + ' | Torch Cannabis Delivery';
    }
    $all('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.tab = b.getAttribute('data-tab'); state.search = ''; state.sort = '';
        var url = state.tab === 'all' ? '/shop-now/' : '/product-category/' + state.tab + '/';
        history.replaceState(null, '', url); draw();
      });
    });
    $all('[data-tier]').forEach(function (b) { b.addEventListener('click', function () { state.tier = b.getAttribute('data-tier'); draw(); }); });
    var active = $('[data-tab].is-on'); if (active && active.scrollIntoView) { active.scrollIntoView({ block: 'nearest', inline: 'center' }); }
    tierCounts();
    draw();
  }

  /* ---------- Flowers page ---------- */
  function flowersPage() {
    var q = params(), state = { tier: TIERS[q.tier] ? q.tier : 'Topshelf', type: 'All' };
    var colors = { Sativa: 'type--sativa', Indica: 'type--indica', Hybrid: 'type--hybrid' };
    function draw() {
      paintTiers(state.tier);
      $all('[data-type]').forEach(function (b) { var on = b.getAttribute('data-type') === state.type; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var list = products.filter(function (p) { return p.cat === 'flowers' && p.tier === state.tier && (state.type === 'All' || p.type === state.type); });
      $('[data-strain-count]').textContent = list.length + ' ' + state.tier + ' strains';
      $('[data-strains]').innerHTML = list.map(function (p) {
        return '<a class="strain" href="/product/' + esc(p.id) + '/"><span class="strain__img"><img src="' + esc(imgOf(p)) + '" alt=""></span>'
          + '<span class="strain__t"><strong>' + esc(p.name) + '</strong><span class="type ' + (colors[p.type] || 'type--hybrid') + '">' + esc((p.type || 'Hybrid').toUpperCase()) + '</span></span>'
          + '<span class="strain__p"><span>from</span><strong>' + money(p.price) + '</strong></span></a>';
      }).join('') || '<div class="empty"><strong>No ' + esc(state.type.toLowerCase()) + ' strains in this tier right now</strong></div>';
    }
    $all('[data-tier]').forEach(function (b) { b.addEventListener('click', function () { state.tier = b.getAttribute('data-tier'); state.type = 'All'; draw(); }); });
    $all('[data-type]').forEach(function (b) { b.addEventListener('click', function () { state.type = b.getAttribute('data-type'); draw(); }); });
    $all('.dside__a[data-cat="flowers"]').forEach(function (a) { a.classList.add('is-on'); });
    tierCounts();
    draw();
  }

  /* ---------- Product page ---------- */
  function productPage() {
    var slug = (location.pathname.match(/product\/([^/]+)/) || [])[1] || params().p;
    var p = catalog[slug];
    var box = $('[data-product]');
    if (!p) {
      box.innerHTML = '<div class="empty"><strong>We couldn\'t find that product</strong><a class="pill pill--green" href="/shop-now/">Back to the menu</a></div>';
      return;
    }
    document.title = p.name + (p.tier ? ' (' + p.tier + ')' : '') + ' | Torch Cannabis Delivery DC';
    var md = $('meta[name="description"]'); if (md) { md.setAttribute('content', (p.short || p.name) + ' Free delivery across Washington, DC. Pay cash at the door.'); }
    var cn = $('link[rel="canonical"]'); if (cn) { cn.setAttribute('href', 'https://torchdc.co/product/' + p.id + '/'); }
    var ld = document.createElement('script'); ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.short || p.description, image: location.origin + imgOf(p),
      offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: p.price, highPrice: Math.max.apply(null, p.options.map(function (o) { return o.price; })), availability: 'https://schema.org/InStock' } });
    document.head.appendChild(ld);
    $all('.dside__a[data-cat="' + p.cat + '"]').forEach(function (a) { a.classList.add('is-on'); });

    var st = { w: 0, qty: 1 };
    var catUrl = p.cat === 'flowers' ? '/flowers/' : '/product-category/' + p.cat + '/';
    var chips = function (arr) { return arr.map(function (x) { return '<span class="chiplet">' + esc(x) + '</span>'; }).join(''); };
    var related = products.filter(function (x) { return x.id !== p.id && (p.tier ? x.tier === p.tier : x.cat === p.cat); }).slice(0, 8);
    box.innerHTML = '<div class="pdp">'
      + '<div class="pdp__img"><img src="' + esc(imgOf(p)) + '" alt="' + esc(p.name) + '">'
      + '<span class="pdp__tags">' + (p.tier ? '<span class="tagdark">' + esc(p.tier.toUpperCase()) + '</span>' : '') + (p.type ? '<span class="taglight">' + esc(p.type.toUpperCase()) + '</span>' : '') + '</span></div>'
      + '<div class="pdp__info">'
      + '<span class="crumbs"><a href="/shop-now/">Shop</a> / <a href="' + catUrl + '">' + esc(CATS[p.cat] || 'Menu') + '</a>' + (p.tier ? ' / ' + esc(p.tier) : '') + '</span>'
      + '<h1>' + esc(p.name) + '</h1>'
      + (p.short ? '<p class="lead">' + esc(p.short) + '</p>' : '')
      + '<span class="pdp__price" data-pprice></span>'
      + (p.options.length > 1 || p.options[0].label ? '<span class="lbl">' + (p.options.length > 1 ? 'Choose weight' : 'Size') + '</span><div class="weights">' + p.options.map(function (o, i) {
        return '<button type="button" class="weight" data-w="' + i + '"><strong>' + esc(o.label || 'Each') + '</strong><span>' + money(o.price) + '</span></button>';
      }).join('') + '</div>' : '')
      + ((p.terpene || p.type || p.bestFor) ? '<div class="facts">'
        + '<div><span>TOP TERPENE</span><strong>' + esc(p.terpene || '[Add terpene]') + '</strong></div>'
        + '<div><span>TYPE</span><strong>' + esc(p.type || 'Hybrid') + '</strong></div>'
        + '<div><span>BEST FOR</span><strong>' + esc(p.bestFor || 'Anytime') + '</strong></div></div>' : '')
      + (p.effects.length ? '<span class="lbl">Effects</span><div class="chiplets">' + chips(p.effects) + '</div>' : '')
      + (p.flavor.length ? '<span class="lbl">Flavor</span><div class="chiplets">' + chips(p.flavor) + '</div>' : '')
      + (p.description ? '<span class="lbl">About this ' + (p.cat === 'flowers' ? 'strain' : 'product') + '</span><p class="pdp__desc">' + esc(p.description) + '</p>' : '')
      + '<div class="perks"><div><strong>Free delivery</strong><span>Across DC</span></div><div><strong>Pay cash</strong><span>At the door</span></div></div>'
      + '<div class="pdp__buy"><div class="stepper"><button type="button" data-q2="-1" aria-label="Remove one">−</button><span data-qv2>1</span><button type="button" data-q2="1" aria-label="Add one">+</button></div><button type="button" class="buybtn" data-buy2>Add to cart</button></div>'
      + '</div></div>'
      + (related.length ? '<section class="sec"><div class="sec__head"><h2>' + (p.tier ? 'More ' + esc(p.tier) + ' strains' : 'You might also like') + '</h2><a href="' + catUrl + '">See all</a></div></section><div class="rail">' + related.map(function (x) { return card(x, ''); }).join('') + '</div>' : '');

    var bar = $('[data-buybar]'); bar.hidden = false;
    function paint() {
      var o = p.options[st.w];
      $('[data-pprice]').textContent = money(o.price);
      $all('[data-w]').forEach(function (b) { var on = Number(b.getAttribute('data-w')) === st.w; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      $all('[data-qv],[data-qv2]').forEach(function (s) { s.textContent = st.qty; });
      $all('[data-buy],[data-buy2]').forEach(function (b) { b.textContent = 'Add to cart · ' + money(o.price * st.qty); });
    }
    $all('[data-w]').forEach(function (b) { b.addEventListener('click', function () { st.w = Number(b.getAttribute('data-w')); paint(); }); });
    $all('[data-q],[data-q2]').forEach(function (b) { b.addEventListener('click', function () { st.qty = Math.max(1, Math.min(20, st.qty + Number(b.getAttribute('data-q') || b.getAttribute('data-q2')))); paint(); }); });
    $all('[data-buy],[data-buy2]').forEach(function (b) { b.addEventListener('click', function () { addKey(p.id + '|' + st.w, st.qty); openSheet(p, st.w, st.qty); }); });
    paint();
    renderAllCart();
  }

  function openSheet(p, w, qty) {
    var sheet = $('[data-sheet]'), body = $('[data-sheet-body]');
    if (!sheet) { return; }
    function draw() {
      var t = totals(), o = p.options[w];
      var half = t.lines.filter(function (l) { return l.p.tier === p.tier && l.o.unit === 'h'; }).reduce(function (s, l) { return s + l.qty; }, 0);
      var html = '<div class="sheet__grip"></div><div class="sheet__ok"><span class="okdot">✓</span><span><strong>Added to cart</strong><span>' + esc(p.name) + (o.label ? ' · ' + esc(o.label) : '') + (qty > 1 ? ' x ' + qty : '') + '</span></span></div>';
      if (p.tier && o.unit === 'o' && window.TorchDeals) {
        var oz = t.lines.filter(function (l) { return l.p.tier === p.tier && l.o.unit === 'o'; }).reduce(function (s, l) { return s + l.qty; }, 0);
        var no = TorchDeals.nextStepOz(p.tier, oz);
        html += '<div class="dealbox"><span class="dealbox__tag">' + (oz >= 8 ? 'HALF-POUND HAUL' : 'STACK &amp; SAVE') + '</span><strong>' + esc(no.title) + '</strong><span class="muted">Mix any ' + esc(p.tier) + ' strains by the ounce.</span>'
          + '<div class="meter"><span style="width:' + (Math.min(oz, 4) * 25) + '%"></span></div></div>';
      }
      if (p.tier && o.unit === 'h' && window.TorchDeals) {
        var ns = TorchDeals.nextStep(p.tier, half);
        var picks = products.filter(function (x) { return x.tier === p.tier && x.id !== p.id && x.options.some(function (oo) { return oo.unit === 'h'; }); }).slice(0, 3);
        html += '<div class="dealbox"><span class="dealbox__tag">BUNDLE DEAL</span><strong>' + esc(ns.title) + '</strong><span class="muted">Mix any ' + esc(p.tier) + ' strains by the half ounce.</span>'
          + '<div class="meter"><span style="width:' + (Math.min(half, 4) * 25) + '%"></span></div>'
          + picks.map(function (x) {
            var wi = x.options.findIndex(function (oo) { return oo.unit === 'h'; }), inCart = (cart()[x.id + '|' + wi] || 0) > 0;
            return '<div class="pickrow"><img src="' + esc(imgOf(x)) + '" alt=""><span><strong>' + esc(x.name) + '</strong><span>' + esc(x.type || '') + ' · ½ oz · ' + money(x.options[wi].price) + '</span></span>'
              + '<button type="button" class="smallpill' + (inCart ? ' is-on' : '') + '" data-pick="' + esc(x.id + '|' + wi) + '">' + (inCart ? 'Added' : '+ Add') + '</button></div>';
          }).join('') + '</div>';
      }
      var addons = products.filter(function (x) { return x.cat !== p.cat && !x.from; }).slice(0, 2);
      if (addons.length) {
        html += '<span class="lbl">Goes great with</span><div class="addons">' + addons.map(function (a) {
          var inCart = (cart()[a.id + '|0'] || 0) > 0;
          return '<div class="addon"><img src="' + esc(imgOf(a)) + '" alt=""><span>' + esc(a.name) + '</span><span class="addon__row"><b>' + money(a.price) + '</b><button type="button" class="addsm' + (inCart ? ' is-on' : '') + '" data-pick="' + esc(a.id) + '|0" aria-label="Add ' + esc(a.name) + '">' + (inCart ? '✓' : '+') + '</button></span></div>';
        }).join('') + '</div>';
      }
      html += '<div class="sheet__btns"><button type="button" class="ghostbtn" data-sheet-close>Keep shopping</button><a class="checkoutbtn" href="/cart/">View cart · ' + money(t.total) + '</a></div>';
      body.innerHTML = html;
    }
    draw();
    sheet.hidden = false;
    sheet.onclick = function (e) {
      if (e.target.closest('[data-sheet-close]')) { sheet.hidden = true; return; }
      var pk = e.target.closest('[data-pick]');
      if (pk) { var k = pk.getAttribute('data-pick'); addKey(k, cart()[k] ? -cart()[k] : 1); draw(); }
    };
  }

  /* ---------- Cart page + checkout ---------- */
  var placing = false, doneOrder = null;
  function renderCartPage() {
    if (doneOrder) { return; }
    var t = totals(), m = mode();
    var full = t.count > 0;
    $('[data-cart-count]').textContent = t.count + (t.count === 1 ? ' item' : ' items');
    $('[data-cart-empty]').hidden = full;
    $('[data-cart-full]').hidden = !full;
    if (!full) { return; }
    $('[data-addr]').hidden = m !== 'delivery';
    $('[data-pickupnote]').hidden = m !== 'pickup';
    // Deal meters: one per tier for half ounces (Bundle Deal) and one per tier for ounces (Stack & Save).
    var counts = {};
    t.lines.forEach(function (l) {
      if (!l.p.tier || !l.o.unit) { return; }
      var c = counts[l.p.tier] || (counts[l.p.tier] = { h: 0, o: 0 });
      c[l.o.unit] += l.qty;
    });
    var db = $('[data-dealbox]'), boxes = [];
    if (window.TorchDeals) {
      Object.keys(counts).forEach(function (tier) {
        var c = counts[tier];
        if (c.h) {
          var ns = TorchDeals.nextStep(tier, c.h);
          boxes.push('<div class="dealbox"><div class="dealbox__top"><span class="dealbox__tag">BUNDLE DEAL</span><span class="muted">' + esc(tier) + ' · ' + Math.min(c.h, 4) + ' of 4 half oz</span></div><strong>' + esc(ns.title) + '</strong>'
            + '<div class="steps4">' + [1, 2, 3, 4].map(function (s) { return '<span class="' + (s <= c.h ? 'is-on' : '') + '">' + s + ' x ½</span>'; }).join('') + '</div>'
            + (c.h < 4 ? '<a class="smallpill" href="/flowers/?tier=' + encodeURIComponent(tier) + '">Add a ' + esc(tier) + ' half ounce</a>' : '') + '</div>');
        }
        if (c.o) {
          var no = TorchDeals.nextStepOz(tier, c.o);
          boxes.push('<div class="dealbox"><div class="dealbox__top"><span class="dealbox__tag">' + (c.o >= 8 ? 'HALF-POUND HAUL' : 'STACK &amp; SAVE') + '</span><span class="muted">' + esc(tier) + ' · ' + c.o + ' oz</span></div><strong>' + esc(no.title) + '</strong>'
            + '<div class="steps4">' + [1, 2, 3, 4].map(function (s) { return '<span class="' + (s <= c.o ? 'is-on' : '') + '">' + s + ' oz</span>'; }).join('') + '</div>'
            + (c.o < 8 ? '<a class="smallpill" href="/flowers/?tier=' + encodeURIComponent(tier) + '">Add a ' + esc(tier) + ' ounce</a>' : '') + '</div>');
        }
      });
    }
    if (t.deals.total > 0) { boxes.unshift('<div class="dealsave">You\'re saving ' + money(t.deals.total) + ' with deals</div>'); }
    db.className = 'dealstack';
    db.hidden = !boxes.length;
    db.innerHTML = boxes.join('');
    $('[data-lines]').innerHTML = t.lines.map(function (l) {
      return '<div class="cline"><span class="cline__img"><img src="' + esc(imgOf(l.p)) + '" alt=""></span>'
        + '<span class="cline__t"><a href="/product/' + esc(l.p.id) + '/"><strong>' + esc(l.p.name) + '</strong></a><span>' + esc([l.p.tier, l.o.label].filter(Boolean).join(' · ')) + '</span><b>' + money(l.total) + '</b></span>'
        + '<span class="mini"><button type="button" data-k="' + esc(l.key) + '" data-d="-1" aria-label="' + (l.qty === 1 ? 'Remove item' : 'Remove one') + '">' + (l.qty === 1 ? '×' : '−') + '</button><span>' + l.qty + '</span><button type="button" data-k="' + esc(l.key) + '" data-d="1" aria-label="Add one">+</button></span></div>';
    }).join('');
    var inCart = {}; t.lines.forEach(function (l) { inCart[l.p.id] = 1; });
    var adds = products.filter(function (p) { return !inCart[p.id] && !p.from && p.price <= 60; }).slice(0, 4);
    $('[data-addons]').innerHTML = adds.length ? '<span class="lbl">Add to your order</span><div class="addons addons--4">' + adds.map(function (a) {
      return '<div class="addon"><img src="' + esc(imgOf(a)) + '" alt=""><span>' + esc(a.name) + '</span><span class="addon__row"><b>' + money(a.price) + '</b><button type="button" class="addsm" data-k="' + esc(a.id) + '|0" data-d="1" aria-label="Add ' + esc(a.name) + '">+</button></span></div>';
    }).join('') + '</div>' : '';
    $('[data-summary]').innerHTML = '<div><span>Subtotal</span><span>' + money(t.sub) + '</span></div>'
      + t.deals.items.map(function (d) { return '<div class="ok"><span>' + esc(d.label) + '</span><span>−' + money(d.amount) + '</span></div>'; }).join('')
      + '<div><span>' + (m === 'delivery' ? 'Delivery' : 'Pickup') + '</span><span class="ok">Free</span></div>'
      + (store('torch_preroll_bonus') ? '<div class="ok"><span>Free pre-roll (switched from pickup)</span><span>$0</span></div>' : '')
      + '<div class="total"><span>Total, paid in cash</span><span>' + money(t.total) + '</span></div>';
    if (!placing) { $('[data-place]').textContent = 'Place order · ' + money(t.total); }
  }
  function checkout() {
    var form = $('[data-checkout]');
    if (!form) { return; }
    var saved = store('torch_details') || {};
    ['name', 'phone', 'email', 'address', 'apt'].forEach(function (k) { if (saved[k] && form.elements[k]) { form.elements[k].value = saved[k]; } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (placing) { return; }
      var f = form.elements, err = $('[data-err]'), m = mode(), t = totals();
      var problems = [];
      if (!f.name.value.trim()) { problems.push('your name'); }
      if (f.phone.value.replace(/\D/g, '').length < 10) { problems.push('a valid mobile number'); }
      if (m === 'delivery' && !f.address.value.trim()) { problems.push('your delivery address'); }
      if (!f.over21.checked) { problems.push('confirmation that you are 21+'); }
      if (problems.length) { err.hidden = false; err.textContent = 'Please add ' + problems.join(', ') + '.'; return; }
      err.hidden = true;
      store('torch_details', { name: f.name.value, phone: f.phone.value, email: f.email.value, address: f.address.value, apt: f.apt.value });
      placing = true;
      var btn = $('[data-place]'); btn.disabled = true; btn.textContent = 'Placing your order…';
      var body = {
        mode: m, name: f.name.value, phone: f.phone.value, email: f.email.value, address: f.address.value, apt: f.apt.value,
        notes: f.notes.value, changeFor: f.changeFor.value.replace(/[^\d.]/g, ''), firstOrder: f.firstOrder.checked, over21: f.over21.checked,
        prerollBonus: !!store('torch_preroll_bonus'),
        items: t.lines.map(function (l) { return { wcId: l.p.wcId, vid: l.o.vid || 0, w: l.o.label || '', qty: l.qty }; })
      };
      fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok || !res.d.ok) { throw new Error(res.d && res.d.error || 'We could not place your order.'); }
          doneOrder = res.d;
          store('torch_cart', null); store('torch_preroll_bonus', null);
          $('[data-cart-full]').hidden = true; $('[data-cart-empty]').hidden = true;
          var done = $('[data-done]'); done.hidden = false;
          done.innerHTML = '<span class="okdot okdot--big">✓</span><h2>Order placed</h2><p>Order #' + esc(res.d.number) + ' · ' + money(Number(res.d.total) || t.total) + ', paid in cash at the door.</p>'
            + '<p>We\'ll text <strong>' + esc(body.phone) + '</strong> when it\'s on the way. Have your 21+ ID ready.</p><a class="pill pill--green" href="/">Back to home</a>';
          renderAllCart();
          window.scrollTo(0, 0);
        })
        .catch(function (e2) {
          err.hidden = false; err.innerHTML = esc(e2.message) + ' <a href="tel:+12024681966">Call (202) 468-1966</a>';
        })
        .then(function () { placing = false; btn.disabled = false; renderCartPage(); });
    });
  }

  /* ---------- Deals page ---------- */
  function dealsPage() {
    var D = window.TorchDeals ? TorchDeals.DEALS : {};
    var notes = { Midshelf: 'Quality flower, priced for value.', Topshelf: 'Our core lineup, now in bulk.', 'Private Reserve': 'Small-batch exotics, better by the ounce.' };
    var tier = TIERS[params().tier] ? params().tier : 'Midshelf';
    function unitPrice(t, unit) {
      var ps = []; products.forEach(function (p) { if (p.tier === t) { p.options.forEach(function (o) { if (o.unit === unit) { ps.push(o.price); } }); } });
      return ps.length ? Math.min.apply(null, ps) : 0;
    }
    function draw() {
      var d = D[tier]; if (!d) { return; }
      $all('[data-dtier]').forEach(function (b) { var on = b.getAttribute('data-dtier') === tier; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      $('[data-tier-note]').textContent = notes[tier];
      $('[data-tier-name]').textContent = tier;
      $('[data-wake-price]').textContent = '$' + d.wake;
      $all('[data-shop-tier]').forEach(function (a) { a.href = '/flowers/?tier=' + encodeURIComponent(tier); });
      var h = unitPrice(tier, 'h'), o = unitPrice(tier, 'o');
      function rows(table, unitLabel, unit, keys) {
        return keys.map(function (k) {
          var save = unit ? unit * k - table[k] : 0;
          return '<div class="drow"><span><strong>' + k + ' ' + unitLabel + '</strong>' + (save > 0 ? '<span class="ok">Save $' + save + '</span>' : '') + '</span><b>' + money(table[k]) + '</b>'
            + '<a class="drow__go" href="/flowers/?tier=' + encodeURIComponent(tier) + '" aria-label="Pick ' + esc(tier) + ' strains">→</a></div>';
        }).join('');
      }
      var cards = [
        { t: 'Bundle Deal', tag: 'MOST POPULAR', desc: 'Mix any ' + tier + ' strains by the half ounce.', rows: rows(d.half, 'half ounces', h, [2, 3, 4]) },
        { t: 'Stack & Save', tag: 'BEST VALUE', desc: 'Stock up by the ounce and save more with every one.', rows: rows(d.oz, 'oz', o, [2, 3, 4]) },
        { t: 'The Half-Pound Haul', tag: 'BIGGEST SAVINGS', desc: 'Half a pound of ' + tier + ' at our lowest price.', rows: rows({ 8: d.haul }, 'oz', o, [8]) }
      ];
      $('[data-dealcards]').innerHTML = cards.map(function (c) {
        return '<div class="dealcard"><div class="dealcard__h"><strong>' + c.t + '</strong><span class="dealtag">' + c.tag + '</span></div><span class="muted">' + esc(c.desc) + '</span>' + c.rows + '</div>';
      }).join('');
    }
    $all('[data-dtier]').forEach(function (b) { b.addEventListener('click', function () { tier = b.getAttribute('data-dtier'); draw(); }); });
    var dl = $('.dside__deals'); if (dl) { dl.classList.add('is-on'); }
    draw();
  }

  /* ---------- Contact form (opens the email app) ---------- */
  function contactForm() {
    var f = $('[data-contact]');
    if (!f) { return; }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = 'Name: ' + f.elements.name.value + '\nReply to: ' + f.elements.reply.value + '\n\n' + f.elements.message.value;
      location.href = 'mailto:info@torchdc.co?subject=' + encodeURIComponent('Message from torchdc.co') + '&body=' + encodeURIComponent(b);
    });
  }

  /* ---------- Pickup paused pop-up ---------- */
  function pickup() {
    var modal = $('#pickup-modal');
    if (!modal) { return; }
    function close() { modal.classList.remove('is-open'); }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-pickup]');
      if (!a || SETTINGS.pickupAvailable) { return; }
      e.preventDefault(); modal.classList.add('is-open');
    });
    modal.addEventListener('click', function (e) { if (e.target === modal) { close(); } });
    $('.modal__x', modal).addEventListener('click', close);
    $('.modal__cta', modal).addEventListener('click', function () {
      store('torch_mode', 'delivery'); store('torch_preroll_bonus', true); close();
      if (page === 'cart' || page === 'shop' || page === 'home' || page === 'product' || page === 'flowers' || page === 'deals') { $all('[data-mode="delivery"]').forEach(function (b) { b.click(); }); if (page === 'cart') { renderCartPage(); } return; }
      location.href = '/shop-now/?mode=delivery';
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); var s = $('[data-sheet]'); if (s) { s.hidden = true; } } });
    if (params().mode === 'pickup' && !SETTINGS.pickupAvailable) { modal.classList.add('is-open'); }
  }

  /* ---------- Age gate ---------- */
  function ageGate() {
    var gate = $('#agegate');
    if (!gate || document.cookie.indexOf('torch_age_ok=1') > -1) { return; }
    gate.classList.add('is-open');
    $('[data-age="yes"]', gate).addEventListener('click', function () {
      var remember = $('#age-remember', gate).checked;
      document.cookie = 'torch_age_ok=1; path=/; SameSite=Lax' + (remember ? '; max-age=' + (60 * 60 * 24 * 30) : '');
      gate.classList.remove('is-open');
    });
    $('[data-age="no"]', gate).addEventListener('click', function () { $('.agegate__ask', gate).hidden = true; $('.agegate__no', gate).hidden = false; $('.agegate__no', gate).style.display = 'flex'; });
    $('[data-age="back"]', gate).addEventListener('click', function () { $('.agegate__ask', gate).hidden = false; $('.agegate__no', gate).hidden = true; $('.agegate__no', gate).style.display = 'none'; });
  }

  /* ---------- About "Read more" ---------- */
  function readMore() {
    $all('[data-more]').forEach(function (btn) {
      var target = document.getElementById(btn.getAttribute('data-more'));
      btn.addEventListener('click', function () {
        var open = target.hidden;
        target.hidden = !open; btn.textContent = open ? 'Show less' : 'Read more';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    openStatus(); setInterval(openStatus, 60000);
    mobileMenu();
    sliders(); pickup(); ageGate(); readMore(); modeToggles(); contactForm(); checkout();
    renderAllCart();
    function paint(refresh) {
      try { rails(); } catch (e) {}
      if (page === 'home') { try { desktopSections(); } catch (e) {} }
      if (page === 'product' && refresh && $('[data-product] .empty')) { productPage(); }
      if (!refresh) {
        if (page === 'shop') { shopPage(); }
        if (page === 'flowers') { flowersPage(); }
        if (page === 'product') { productPage(); }
        if (page === 'deals') { dealsPage(); }
      }
      renderAllCart();
    }
    loadProducts(function () { paint(true); }).then(function () { paint(false); });
  });
})();
