import re

# Read verbatim reference CSS
with open('client-reference/assets/css/site.css', 'r', encoding='utf-8') as f:
    ref_css = f.read()

# Custom Next.js additions that do NOT collide with reference typography
nextjs_additions = """
/* ==========================================================================
   NEXT.JS & APP-SPECIFIC ENHANCEMENTS
   Preserves 100% of reference site.css rules while supporting React elements
   ========================================================================== */

/* Cart bar link and labels contrast */
.cartbar a,
.cartbar a:hover,
.cartbar a:visited,
.cartbar__l,
.cartbar__l strong,
.cartbar__l span,
.cartbar__count {
  color: #FFFFFF !important;
}

.cartbar .cartbar__total,
.cartbar__total {
  margin-left: auto;
  height: 44px;
  padding: 0 18px;
  border-radius: 22px;
  background: #FFFFFF !important;
  color: var(--green-dark) !important;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
}

/* React / Next.js Anchor & Button tag color integrity */
.pill,
.pill--green,
.pill--black,
a.pill,
a.pill--green,
a.pill--black,
.btn-wide,
a.btn-wide,
.checkoutbtn,
a.checkoutbtn,
.buybtn,
a.buybtn,
.placebtn,
a.placebtn,
.wake__go,
a.wake__go,
.drow__go,
a.drow__go,
.mnav__call,
a.mnav__call,
.openbar__call,
a.openbar__call,
.iconbtn--cart,
.dealsave,
.wake__tag,
.tag,
.tagdark,
.pcard__new,
.step__icon,
.okdot,
.smallpill.is-on,
.chip.is-on,
.tier.is-on .tier__n,
.tier.is-on .tier__d,
.tier.is-on .tier__c,
.steps4 span.is-on,
.asteps__n,
.add.is-in,
.addsm.is-on {
  color: #FFFFFF !important;
}

.wake__go:hover,
a.wake__go:hover,
.drow__go:hover,
a.drow__go:hover,
.pill--green:hover,
a.pill--green:hover,
.btn-wide:hover,
a.btn-wide:hover,
.checkoutbtn:hover,
a.checkoutbtn:hover,
.placebtn:hover,
a.placebtn:hover {
  color: #FFFFFF !important;
}

.wake__go svg,
a.wake__go svg,
.drow__go svg,
a.drow__go svg {
  color: #FFFFFF !important;
  stroke: #FFFFFF !important;
}

.pill--green:visited,
a.pill--green:visited {
  color: #FFFFFF !important;
}

.btn-wide--ghost:hover,
a.btn-wide--ghost:hover {
  color: var(--ink) !important;
}

/* Category & filter chips rendered as Link / button */
.chip,
a.chip,
button.chip {
  flex: none;
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  border: 1.5px solid var(--line-2);
  background: #FFFFFF;
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  vertical-align: middle;
  transition: all 0.15s ease;
  cursor: pointer;
}

.chip:hover,
a.chip:hover,
button.chip:hover {
  border-color: var(--green);
  color: var(--green-dark);
}

.chip.is-on,
a.chip.is-on,
button.chip.is-on {
  background: var(--green);
  border-color: var(--green);
  color: #FFFFFF !important;
}

/* Hybrid Strain Badge Styling */
.type--hybrid,
.chip--hybrid,
.pcard__type.type--hybrid,
.pdetail__type.type--hybrid,
span.type--hybrid {
  background: var(--mint) !important;
  color: var(--green-dark) !important;
  border: 1px solid rgba(46, 125, 50, 0.25) !important;
}

/* Sticky cart clearance on mobile */
main.shell__main,
.cartgrid,
.deals-main {
  padding-bottom: 96px !important;
}

@media (min-width: 1100px) {
  main.shell__main,
  .cartgrid,
  .deals-main {
    padding-bottom: 24px !important;
  }
}


.deals-main {
  max-width: 760px;
}

.deals-page .shell__main > .seg--3 {
  max-width: 760px;
  margin: 14px 16px 0;
}

@media (min-width: 1100px) {
  .deals-page .shell__main > .seg--3 {
    margin-left: 0;
    margin-right: 0;
  }
}

/* Added-to-cart Sheet Interactive controls */
.sheet__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sheet__close {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background: #F2F4F2;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.sheet__close:hover {
  background: #E2ECE1;
  color: #111111;
  transform: scale(1.05);
}

.sheet__grip:hover {
  background: #B8C2B8;
}

/* Desktop Neighborhoods section */
.hoods--desktop {
  margin-top: 32px;
  padding: 0 16px;
}

.hoods--desktop .sec__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}

.hoods--desktop .sec__head h2 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin: 0;
}

.hoods--desktop .hoods__sub {
  font-size: 13px;
  color: var(--muted);
}

.hoods--desktop .hoods__rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hoods--desktop .hoods__rail a {
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--soft);
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.hoods--desktop .hoods__rail a:hover {
  background: var(--mint);
  color: var(--green-dark);
}

/* Contact form interactive states */
.contacts a:hover {
  transform: translateY(-2px);
  background: #E2ECE1;
}

.msg input:focus,
.msg textarea:focus {
  outline: none;
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(90,128,91,0.12);
}

.msg .fine {
  font-size: 12px;
  color: var(--muted);
  margin-top: 8px;
  text-align: center;
  display: block;
}

/* Additional link hover polish */
.crumbs a:hover,
.footer a:hover,
.dside__a:hover {
  color: var(--green-dark);
}
"""

# In ref_css, ensure :root defines both --muted and --site-muted
synchronized_css = ref_css.replace(
    "--muted: #4F5A50;",
    "--muted: #4F5A50;\n  --site-muted: #4F5A50;"
)

# Combine verbatim reference CSS with our non-colliding enhancements
final_css = synchronized_css + "\n" + nextjs_additions

with open('src/app/client-site.css', 'w', encoding='utf-8') as f:
    f.write(final_css)

print("Synchronized src/app/client-site.css with verbatim client reference site.css!")
