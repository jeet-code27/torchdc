"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/cart-context";
import { unitOf, nextStep, nextStepOz, normalizeTier } from "@/lib/deals";
import { MinNote } from "@/components/storefront/order-minimum";
import { orderLabel } from "@/lib/orders/display";
import { CheckoutAddress, type PickedPlace, type Zone } from "@/components/storefront/checkout-address";
import { OrderConfirmation, type PlacedOrder } from "@/components/storefront/order-confirmation";

const money = (n: number) => `$${(Math.round(n * 100) / 100).toLocaleString("en-US")}`;
const newSessionId = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 3) | 8).toString(16);
  });
const PIN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A805B" strokeWidth="2" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export default function CartPage() {
  const { data: session } = useSession();
  const {
    items,
    fulfillment,
    setFulfillment,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalCount,
    deals,
    finalTotal,
    hasPrerollBonus,
    sessionId,
    minShortfall,
    setIsMinSheetOpen,
    syncCustomerInfo,
  } = useCart();

  // Form states (Oct 24: no email, apartment, change, first-order or 21+ fields)
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Delivery area and the picked Google address (fee decided by the server)
  const [zone, setZoneState] = React.useState<Zone>("DC");
  const [place, setPlaceState] = React.useState<PickedPlace | null>(null);
  const [acOff, setAcOff] = React.useState(false);
  const [placeSession, setPlaceSession] = React.useState("");

  const [formError, setFormError] = React.useState("");
  const [isPlacing, setIsPlacing] = React.useState(false);
  const [placedOrder, setPlacedOrder] = React.useState<PlacedOrder | null>(null);

  // Restore saved details, area and picked address
  React.useEffect(() => {
    setPlaceSession(newSessionId());
    try {
      const saved = localStorage.getItem("torch_details");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
      }
      const z = localStorage.getItem("torch_zone");
      if (z === "DC" || z === "MD" || z === "VA") setZoneState(z);
      const p = JSON.parse(localStorage.getItem("torch_place") || "null");
      if (p && p.id && p.address) {
        setPlaceState(p);
        setAddress(p.address);
      }
    } catch {
      // ignore
    }

    if (session?.user?.name) setName((cur) => cur || session.user!.name || "");
  }, [session]);

  // Contact details typed so far go with the cart, so abandoned carts show who to follow up with
  React.useEffect(() => {
    if (!name.trim() && !phone.trim() && !address.trim()) return;
    syncCustomerInfo({ name: name.trim(), phone: phone.trim(), address: address.trim() });
  }, [name, phone, address, syncCustomerInfo]);

  const setZone = (z: Zone) => {
    setZoneState(z);
    try {
      localStorage.setItem("torch_zone", z);
    } catch {}
    // A picked address in another state no longer fits
    if (place && place.state !== z) {
      setPlace(null);
      setAddress("");
    }
  };
  const setPlace = (p: PickedPlace | null) => {
    setPlaceState(p);
    try {
      if (p) localStorage.setItem("torch_place", JSON.stringify(p));
      else localStorage.removeItem("torch_place");
    } catch {}
    if (p && (p.state === "DC" || p.state === "MD" || p.state === "VA") && p.state !== zone) {
      setZoneState(p.state);
      try {
        localStorage.setItem("torch_zone", p.state);
      } catch {}
    }
  };

  const isDelivery = fulfillment === "delivery";
  const quote = isDelivery ? place?.quote || null : null;
  const tooFar = quote?.band === "far";
  const otherState = quote?.band === "other";
  // DC free; MD/VA $20 near the Beltway, $40 farther (known once an address is picked)
  const fee = !isDelivery ? 0 : quote ? quote.fee || 0 : zone !== "DC" && acOff ? 20 : 0;
  const totalDue = finalTotal + fee;
  const feeText = !isDelivery
    ? null
    : tooFar
    ? "Text us"
    : quote
    ? quote.fee
      ? money(quote.fee)
      : null
    : zone === "DC"
    ? null
    : acOff
    ? "$20"
    : "$20 or $40";
  const smsHref = `sms:+12024681966?&body=${encodeURIComponent(
    `Hi! I'd like a delivery to ${place?.address || address}. Can you deliver there?`
  )}`;

  // Aggregate item weights per flower tier
  const flowerCounts = React.useMemo(() => {
    const counts: Record<string, { h: number; o: number }> = {};
    items.forEach((item) => {
      const tier = normalizeTier(item.tier || "");
      const unit = unitOf(item.weight);
      if (!tier || !unit) return;
      if (!counts[tier]) counts[tier] = { h: 0, o: 0 };
      counts[tier][unit] += item.quantity;
    });
    return counts;
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPlacing) return;
    // $60 minimum after deals: show the "Almost there" popup instead of placing the order
    if (minShortfall > 0) {
      setIsMinSheetOpen(true);
      return;
    }

    // Out of range: the button texts the store instead of ordering
    if (isDelivery && tooFar) {
      window.location.href = smsHref;
      return;
    }

    const problems: string[] = [];
    if (!name.trim()) problems.push("your name");
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) problems.push("a valid mobile number");
    if (isDelivery && !place && !(acOff && address.trim())) {
      problems.push(acOff ? "your delivery address" : "your address (pick it from the list)");
    }
    if (isDelivery && otherState) problems.push("an address in DC, Maryland or Virginia");

    if (problems.length > 0) {
      setFormError(`Please add ${problems.join(", ")}.`);
      return;
    }
    setFormError("");

    try {
      localStorage.setItem(
        "torch_details",
        JSON.stringify({ name, phone })
      );
    } catch {
      // ignore
    }

    setIsPlacing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone },
          fulfillment,
          zone,
          placeId: place?.id || "",
          placeSession,
          deliveryAddress: { street: place?.address || address },
          deliveryNotes: notes,
          prerollBonus: hasPrerollBonus,
          items: items.map((it) => ({
            id: it.id,
            name: it.name,
            slug: it.slug,
            price: it.price,
            quantity: it.quantity,
            image: it.image,
            weight: it.weight,
            tier: it.tier,
            category: it.category,
          })),
          sessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "We could not place your order.");
      }

      setPlacedOrder({
        orderNumber: data.orderNumber || "ORDER",
        firstName: name.trim().split(/\s+/)[0] || "",
        isDelivery,
        address: data.address || place?.address || address,
        lines: items.map((it) => ({ name: it.name, weight: it.weight, quantity: it.quantity, total: it.price * it.quantity })),
        deals: deals.items.map((d) => ({ label: d.label, amount: d.amount })),
        fee: Number(data.deliveryFee) || 0,
        total: Number(data.total) || totalDue,
      });

      setPlace(null);
      setAddress("");
      clearCart();
      window.scrollTo(0, 0);
    } catch (err: any) {
      setFormError(err.message || "We could not place your order. Please call (202) 468-1966.");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <main>
      <div className="cartpage">
        {/* Page Head (hidden on the confirmation screen) */}
        <div className="pagehead" hidden={Boolean(placedOrder)}>
          <div>
            <h1>Your Cart</h1>
            <span className="muted">
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </span>
          </div>
          <Link href="/shop-now">Keep shopping</Link>
        </div>

        {/* Empty state */}
        {!placedOrder && items.length === 0 && (
          <div className="empty">
            <strong>Your cart is empty</strong>
            <Link className="pill pill--green" href="/shop-now">
              Start shopping
            </Link>
          </div>
        )}

        {/* Success screen */}
        {placedOrder && (
          <div className="done">
            <OrderConfirmation order={{ ...placedOrder, orderNumber: orderLabel(placedOrder.orderNumber) }} />
          </div>
        )}

        {/* Full Cart Grid */}
        {!placedOrder && items.length > 0 && (
          <div className="cartgrid">
            {/* Left Column: Delivery/Pickup toggle, Deal Stack, Lines, Addons */}
            <div className="cartcol">
              {/* Delivery / Pickup tab list */}
              <div className="seg seg--green" role="tablist" aria-label="Delivery or pickup">
                <button
                  type="button"
                  role="tab"
                  aria-selected={fulfillment === "delivery"}
                  className={fulfillment === "delivery" ? "is-on" : ""}
                  onClick={() => setFulfillment("delivery")}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={fulfillment === "pickup"}
                  className={fulfillment === "pickup" ? "is-on" : ""}
                  onClick={() => setFulfillment("pickup")}
                >
                  Pickup
                </button>
              </div>

              {/* Deal Stack with dynamic interactive step meters */}
              <div className="dealstack">
                {deals.total > 0 && (
                  <div className="dealsave">
                    You&apos;re saving ${deals.total} with deals
                  </div>
                )}

                {Object.keys(flowerCounts).map((tier) => {
                  const c = flowerCounts[tier];
                  const boxes = [];

                  if (c.h > 0) {
                    const ns = nextStep(tier, c.h);
                    if (ns) {
                      boxes.push(
                        <div key={`${tier}-h`} className="dealbox">
                          <div className="dealbox__top">
                            <span className="dealbox__tag">BUNDLE DEAL</span>
                            <span className="muted">
                              {Math.min(c.h, 4)} of 4 half oz
                            </span>
                          </div>
                          <strong>
                            {c.h >= 4
                              ? `Best deal unlocked: 4 half ounces for $250`
                              : ns.title}
                          </strong>
                          <div className="steps4">
                            {[1, 2, 3, 4].map((s) => (
                              <span key={s} className={s <= c.h ? "is-on" : ""}>
                                {s} x ½
                              </span>
                            ))}
                          </div>
                          {c.h < 4 && (
                            <Link
                              className="smallpill"
                              href={`/flowers?tier=${encodeURIComponent(tier)}`}
                            >
                              Add a {tier} half ounce
                            </Link>
                          )}
                        </div>
                      );
                    }
                  }

                  if (c.o > 0) {
                    const no = nextStepOz(tier, c.o);
                    if (no) {
                      boxes.push(
                        <div key={`${tier}-o`} className="dealbox">
                          <div className="dealbox__top">
                            <span className="dealbox__tag">
                              {c.o >= 8 ? "HALF-POUND HAUL" : "STACK & SAVE"}
                            </span>
                            <span className="muted">
                              {tier} · {c.o} oz
                            </span>
                          </div>
                          <strong>{no.title}</strong>
                          <div className="steps4">
                            {[1, 2, 3, 4].map((s) => (
                              <span key={s} className={s <= c.o ? "is-on" : ""}>
                                {s} oz
                              </span>
                            ))}
                          </div>
                          {c.o < 8 && (
                            <Link
                              className="smallpill"
                              href={`/flowers?tier=${encodeURIComponent(tier)}`}
                            >
                              Add a {tier} ounce
                            </Link>
                          )}
                        </div>
                      );
                    }
                  }

                  return boxes;
                })}
              </div>

              {/* Cart items list */}
              <div className="lines">
                {items.map((item) => (
                  <div key={`${item.id}-${item.weight || "def"}`} className="cline">
                    <span className="cline__img">
                      <Image
                        src={item.image || "/assets/img/flower.webp"}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </span>
                    <span className="cline__t">
                      <Link href={`/product/${item.slug || item.id}`}>
                        <strong>{item.name}</strong>
                      </Link>
                      {[item.tier, item.weight].filter(Boolean).length > 0 && (
                        <span>
                          {[item.tier, item.weight].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      <b>${item.price * item.quantity}</b>
                    </span>
                    <span className="mini">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity === 1
                            ? removeItem(item.id, item.weight)
                            : updateQuantity(item.id, item.quantity - 1, item.weight)
                        }
                        aria-label={item.quantity === 1 ? "Remove item" : "Remove one"}
                      >
                        {item.quantity === 1 ? "×" : "−"}
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1, item.weight)
                        }
                        aria-label="Add one"
                      >
                        +
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Checkout form & live order summary */}
            <form className="checkout" onSubmit={handleSubmit} noValidate>
              <div className="flex items-center justify-between">
                <h2>Checkout</h2>
                {session?.user && (
                  <span className="text-[12px] font-semibold text-[#2F4F30] bg-[#EEF5EE] px-2.5 py-1 rounded-full">
                    Account: {session.user.name || session.user.email}
                  </span>
                )}
              </div>

              <label htmlFor="c-name">Full name</label>
              <input
                id="c-name"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label htmlFor="c-phone">Mobile phone</label>
              <input
                id="c-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                placeholder="We text you order updates"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {isDelivery && (
                <div>
                  <label id="c-zone-l">Delivering to</label>
                  <div className="seg seg--3 seg--green zoneseg" role="radiogroup" aria-labelledby="c-zone-l">
                    {(
                      [
                        ["DC", "DC"],
                        ["MD", "Maryland"],
                        ["VA", "Virginia"],
                      ] as [Zone, string][]
                    ).map(([z, label]) => (
                      <button
                        key={z}
                        type="button"
                        role="radio"
                        aria-checked={zone === z}
                        className={zone === z ? "is-on" : ""}
                        onClick={() => setZone(z)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="zonehint" hidden={zone === "DC"}>
                    Inside or near the Beltway: <b>$20</b>. Farther: <b>$40</b>.
                  </p>
                  <label htmlFor="c-addr">Delivery address</label>
                  <CheckoutAddress
                    value={address}
                    onValueChange={setAddress}
                    place={place}
                    onPlace={setPlace}
                    acOff={acOff}
                    onAcOff={() => setAcOff(true)}
                    session={placeSession}
                    onNewSession={() => setPlaceSession(newSessionId())}
                  />
                  <div>
                    {tooFar && (
                      <div className="toofar">
                        <b>
                          Uh-oh, that&apos;s a little outside
                          <br />
                          our delivery range.
                        </b>
                        <span>
                          Reach out at <a href={smsHref}>(202) 468-1966</a> and we&apos;ll see what we can do.
                        </span>
                      </div>
                    )}
                    {otherState && (
                      <div className="toofar">
                        <b>We deliver in DC, Maryland and Virginia.</b>
                        <span>Please pick an address there.</span>
                      </div>
                    )}
                  </div>
                  <p className="meetnote">
                    {PIN}
                    <span>
                      Your driver will text you when they&apos;re on the way and when they&apos;re outside, so you can step out
                      and grab your order.
                    </span>
                  </p>
                </div>
              )}

              {fulfillment === "pickup" && (
                <div className="pickupnote">
                  <strong>Pickup at 1000 G St NW</strong>
                  <span>We text you when it&apos;s ready.</span>
                </div>
              )}

              <label htmlFor="c-notes">
                Notes for your driver <span className="opt">(optional)</span>
              </label>
              <textarea
                id="c-notes"
                name="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {/* Order summary breakdown */}
              <div className="summary">
                <div>
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>

                {deals.items.map((d, idx) => (
                  <div key={idx} className="ok">
                    <span>{d.label}</span>
                    <span>−${d.amount}</span>
                  </div>
                ))}

                <div>
                  <span>{isDelivery ? "Delivery" : "Pickup"}</span>
                  {feeText ? <span>{feeText}</span> : <span className="ok">Free</span>}
                </div>

                {hasPrerollBonus && (
                  <div className="ok">
                    <span>Free pre-roll (switched from pickup)</span>
                    <span>$0</span>
                  </div>
                )}

                <div className="total">
                  <span>Total, paid in cash</span>
                  <span>{money(totalDue)}</span>
                </div>
                <MinNote />
              </div>

              {formError && (
                <p className="formerr" role="alert">
                  {formError}
                </p>
              )}

              <button
                className={`placebtn ${minShortfall > 0 ? "is-off" : ""}`}
                type="submit"
                disabled={isPlacing}
              >
                {isPlacing
                  ? "Placing your order…"
                  : minShortfall > 0
                  ? `Add ${money(minShortfall)} more to order`
                  : isDelivery && tooFar
                  ? "Text us about delivery"
                  : `Place order · ${money(totalDue)}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
