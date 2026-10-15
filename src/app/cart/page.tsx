"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/cart-context";
import { unitOf, nextStep, nextStepOz, normalizeTier } from "@/lib/deals";
import { CartAddToOrder } from "@/components/storefront/cart-add-to-order";

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
  } = useCart();

  // Form states
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [apt, setApt] = React.useState("");
  const [changeFor, setChangeFor] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [firstOrder, setFirstOrder] = React.useState(false);
  const [over21, setOver21] = React.useState(true);

  const [formError, setFormError] = React.useState("");
  const [isPlacing, setIsPlacing] = React.useState(false);
  const [placedOrder, setPlacedOrder] = React.useState<{
    orderNumber: string;
    total: number;
    phone: string;
  } | null>(null);

  // Restore saved details from localStorage or Session
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("torch_details");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.apt) setApt(parsed.apt);
      }
    } catch {
      // ignore
    }

    if (session?.user) {
      if (session.user.name && !name) setName(session.user.name);
      if (session.user.email && !email) setEmail(session.user.email);
    }
  }, [session]);

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

    const problems: string[] = [];
    if (!name.trim()) problems.push("your name");
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) problems.push("a valid mobile number");
    if (fulfillment === "delivery" && !address.trim()) problems.push("your delivery address");
    if (!over21) problems.push("confirmation that you are 21+");

    if (problems.length > 0) {
      setFormError(`Please add ${problems.join(", ")}.`);
      return;
    }
    setFormError("");

    try {
      localStorage.setItem(
        "torch_details",
        JSON.stringify({ name, phone, email, address, apt })
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
          customer: { name, phone, email },
          fulfillment,
          deliveryAddress: {
            street: address,
            apartment: apt,
            city: "Washington",
            state: "DC",
            zip: "20001",
          },
          deliveryNotes: notes,
          changeFor: changeFor.replace(/[^\d.]/g, ""),
          firstOrder,
          prerollBonus: hasPrerollBonus,
          isAgeVerified: over21,
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
        total: Number(data.total) || finalTotal,
        phone,
      });

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
        {/* Page Head */}
        <div className="pagehead">
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
            <span className="okdot okdot--big">✓</span>
            <h2>Order placed</h2>
            <p>
              Order #{placedOrder.orderNumber} · ${placedOrder.total}, paid in cash at the door.
            </p>
            <p>
              We&apos;ll text <strong>{placedOrder.phone}</strong> when it&apos;s on the way. Have your 21+ ID ready.
            </p>
            <Link className="pill pill--green" href="/">
              Back to home
            </Link>
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
                              {tier} · {Math.min(c.h, 4)} of 4 half oz
                            </span>
                          </div>
                          <strong>{ns.title}</strong>
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
                        src={item.image || "/assets/img/logo.webp"}
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
                      <span>
                        {[item.tier, item.weight].filter(Boolean).join(" · ")}
                      </span>
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

              {/* Quick Add-on cross-sells */}
              <CartAddToOrder compact={true} />
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

              <div className="paynote">
                <strong>Pay with cash at the door</strong>
                <span>
                  Cash only. Your driver checks your 21+ ID before handing over your order.
                </span>
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

              <label htmlFor="c-email">
                Email <span className="opt">(optional)</span>
              </label>
              <input
                id="c-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {fulfillment === "delivery" && (
                <div>
                  <label htmlFor="c-addr">Delivery address</label>
                  <input
                    id="c-addr"
                    name="address"
                    autoComplete="street-address"
                    placeholder="Street address in Washington, DC"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <label htmlFor="c-apt">
                    Apt, suite or buzzer <span className="opt">(optional)</span>
                  </label>
                  <input
                    id="c-apt"
                    name="apt"
                    autoComplete="address-line2"
                    value={apt}
                    onChange={(e) => setApt(e.target.value)}
                  />
                </div>
              )}

              {fulfillment === "pickup" && (
                <div className="pickupnote">
                  <strong>Pickup at 1000 G St NW</strong>
                  <span>We text you when it&apos;s ready.</span>
                </div>
              )}

              <label htmlFor="c-change">
                Need change? Paying with <span className="opt">(optional)</span>
              </label>
              <div className="moneyin">
                <span>$</span>
                <input
                  id="c-change"
                  name="changeFor"
                  inputMode="numeric"
                  placeholder="e.g. 100"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                />
              </div>

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

              <label className="check">
                <input
                  type="checkbox"
                  name="firstOrder"
                  checked={firstOrder}
                  onChange={(e) => setFirstOrder(e.target.checked)}
                />
                This is my first Torch order
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  name="over21"
                  required
                  checked={over21}
                  onChange={(e) => setOver21(e.target.checked)}
                />
                I&apos;m 21 or older and will show a valid ID
              </label>

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
                  <span>{fulfillment === "delivery" ? "Delivery" : "Pickup"}</span>
                  <span className="ok">Free</span>
                </div>

                {hasPrerollBonus && (
                  <div className="ok">
                    <span>Free pre-roll (switched from pickup)</span>
                    <span>$0</span>
                  </div>
                )}

                <div className="total">
                  <span>Total, paid in cash</span>
                  <span>${finalTotal}</span>
                </div>
              </div>

              {formError && (
                <p className="formerr" role="alert">
                  {formError}
                </p>
              )}

              <button
                className="placebtn"
                type="submit"
                disabled={isPlacing}
              >
                {isPlacing ? "Placing your order…" : `Place order · $${finalTotal}`}
              </button>

              <span className="fine">
                Free delivery across DC. We text you when your order is on the way.
              </span>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
