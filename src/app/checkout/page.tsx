"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  Store,
  ShieldCheck,
  Phone,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  Lock,
  Tag,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/cart-context";
import { CustomerAuthModal } from "@/components/storefront/customer-auth-modal";
import { CartAddToOrder } from "@/components/storefront/cart-add-to-order";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const {
    items,
    fulfillment,
    setFulfillment,
    deliveryZip,
    setDeliveryZip,
    subtotal,
    totalCount,
    clearCart,
    sessionId,
    syncCustomerInfo,
  } = useCart();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [apartment, setApartment] = React.useState("");
  const [zip, setZip] = React.useState(deliveryZip || "20004");
  const [notes, setNotes] = React.useState("");
  const [isAgeVerified, setIsAgeVerified] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Promo code states
  const [promoCode, setPromoCode] = React.useState("");
  const [isApplyingPromo, setIsApplyingPromo] = React.useState(false);
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        toast.success(`Coupon "${data.coupon.code}" applied!`);
        setPromoCode("");
      } else {
        toast.error(data.error || "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Keep cart context zip in sync
  React.useEffect(() => {
    if (zip) setDeliveryZip(zip);
  }, [zip, setDeliveryZip]);

  // Pre-fill fields from active customer session
  React.useEffect(() => {
    if (session?.user && session.user.role === "customer") {
      if (session.user.name && !name) setName(session.user.name);
      if (session.user.email && !email) setEmail(session.user.email);
      if (session.user.phone && !phone) setPhone(session.user.phone);
    }
  }, [session, name, email, phone]);

  // Sync customer info live to capture potential abandoned carts
  const handleBlurCustomerInfo = () => {
    if (name || email || phone || street) {
      syncCustomerInfo({
        name,
        email,
        phone,
        address: street ? `${street} ${apartment}`.trim() : "",
        city: "Washington",
        zip,
      });
    }
  };

  // Live phone formatter for (XXX) XXX-XXXX
  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setPhone(formatted);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (items.length === 0) {
      setErrorMsg("Your cart is empty. Please add items from our menu first.");
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please fill in your name, email, and mobile phone number.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number (e.g. (202) 555-0143).");
      return;
    }

    if (fulfillment === "delivery" && (!street.trim() || !zip.trim())) {
      setErrorMsg("Please enter your Washington DC street address and ZIP code.");
      return;
    }

    if (!isAgeVerified) {
      setErrorMsg("You must confirm you are 21 years of age or older.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
          fulfillment,
          deliveryAddress: {
            street: street.trim(),
            apartment: apartment.trim(),
            city: "Washington",
            state: "DC",
            zip: zip.trim(),
          },
          deliveryNotes: notes.trim(),
          items,
          sessionId,
          userId: session?.user?.id || null,
          isAgeVerified: true,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order.");
      }

      // Success: Clear cart & route to confirmation screen
      clearCart();
      toast.success("Order confirmed successfully!", { duration: 3000 });
      router.push(`/order-success/${data.orderId}`);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Order error:", error);
      setErrorMsg(error.message || "Failed to submit order. Please call us at (202) 468-1966.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfa] text-neutral-900 pb-20">
      {/* Checkout Minimal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors py-1.5 px-3 rounded-full bg-white border border-neutral-200/80 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Menu</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-32 h-8">
              <Image
                src="/images/torch-logo.svg"
                alt="Torch"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
            <Lock className="w-3.5 h-3.5 text-[#5A805B]" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
            Fast DC delivery in 35-45 minutes or 15-minute curbside pickup.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-neutral-200/80 max-w-lg mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-[#5A805B]/10 text-[#5A805B] flex items-center justify-center mx-auto mb-4">
              <Truck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-neutral-900">Your cart is empty</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-xs mx-auto">
              Please browse our dispensary menu and add your favorite strains or edibles first.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-[#5A805B] text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-md hover:bg-[#4d704e] transition-all"
            >
              Explore Dispensary Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ================= LEFT COLUMN: CHECKOUT FORM ================= */}
            <form
              onSubmit={handlePlaceOrder}
              className="lg:col-span-7 space-y-6"
            >
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Fulfillment Mode Toggle */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                  <span>1. Select Order Mode</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillment("delivery")}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 overflow-hidden ${
                      fulfillment === "delivery"
                        ? "border-[#5A805B] bg-[#edf4ec] text-neutral-900 shadow-2xs"
                        : "border-neutral-200/90 bg-white text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-black text-sm min-w-0">
                        <Truck className="w-4 h-4 text-[#5A805B] shrink-0" />
                        <span className="truncate">DC Delivery</span>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-[#5A805B] text-white px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                        FREE
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium leading-normal">
                      Across DC · 35-45 min
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment("pickup")}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 overflow-hidden ${
                      fulfillment === "pickup"
                        ? "border-[#5A805B] bg-[#edf4ec] text-neutral-900 shadow-2xs"
                        : "border-neutral-200/90 bg-white text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-black text-sm min-w-0">
                        <Store className="w-4 h-4 text-[#5A805B] shrink-0" />
                        <span className="truncate">Curbside Pickup</span>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full shrink-0">
                        15 MIN
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium leading-normal">
                      1025 F St NW, Washington, DC
                    </span>
                  </button>
                </div>

                {fulfillment === "pickup" && (
                  <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-neutral-200/80 flex items-start gap-2.5 text-xs">
                    <MapPin className="w-4 h-4 text-[#557754] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-neutral-900 block">
                        Pickup Location:
                      </span>
                      <span className="text-neutral-600">
                        1025 F St NW, Washington, DC 20004 · Open daily 7AM - 11PM.
                        Your order will be ready for curbside handoff within 15 minutes.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Customer Information (Guest or Logged In) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-neutral-900">
                    2. Contact Information
                  </h2>
                  {session?.user && session.user.role === "customer" ? (
                    <span className="text-[11px] font-bold text-[#5A805B] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Signed In as {session.user.name?.split(" ")[0]}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="text-[11px] font-bold text-[#5A805B] hover:underline cursor-pointer"
                    >
                      Already a customer? Sign In →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={handleBlurCustomerInfo}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#557754]/30 focus:border-[#557754]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-neutral-700">
                        Mobile Phone (for ETA SMS) <span className="text-red-500">*</span>
                      </label>
                      {phone.replace(/\D/g, "").length === 10 ? (
                        <span className="text-[10px] text-[#5A805B] font-bold">
                          ✓ Verified 10 Digits
                        </span>
                      ) : phone.replace(/\D/g, "").length > 0 ? (
                        <span className="text-[10px] text-amber-600 font-medium">
                          {10 - phone.replace(/\D/g, "").length} digits left
                        </span>
                      ) : null}
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1 text-neutral-500 font-semibold text-xs pointer-events-none pr-2 border-r border-neutral-200">
                        <span>+1</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onBlur={handleBlurCustomerInfo}
                        placeholder="(202) 555-0199"
                        maxLength={14}
                        className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700">
                      Email Address (for Receipt) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleBlurCustomerInfo}
                      placeholder="e.g. alex@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#557754]/30 focus:border-[#557754]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Delivery Address (Visible only for delivery mode) */}
              {fulfillment === "delivery" && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                  <h2 className="text-base font-extrabold text-neutral-900">
                    3. Washington D.C. Delivery Address
                  </h2>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        onBlur={handleBlurCustomerInfo}
                        placeholder="e.g. 1400 K St NW"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700">
                          Apt / Suite / Floor
                        </label>
                        <input
                          type="text"
                          value={apartment}
                          onChange={(e) => setApartment(e.target.value)}
                          onBlur={handleBlurCustomerInfo}
                          placeholder="Apt 4B"
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700">
                          City
                        </label>
                        <input
                          type="text"
                          disabled
                          value="Washington, DC"
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-500 text-sm font-semibold select-none cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700">
                          ZIP Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          onBlur={handleBlurCustomerInfo}
                          placeholder="20004"
                          maxLength={5}
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700">
                        Delivery Notes / Gate Code (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Call upon arrival, buzzer #12, leave at front desk"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Payment Method & Age Verification */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <h2 className="text-base font-extrabold text-neutral-900">
                  4. Payment & Age Verification
                </h2>

                <div className="p-4 rounded-2xl bg-[#5A805B]/10 border border-[#5A805B]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5A805B] text-white flex items-center justify-center font-black text-sm">
                      $
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-neutral-900 block">
                        Cash on {fulfillment === "delivery" ? "Delivery" : "Pickup"}
                      </span>
                      <span className="text-xs text-neutral-600 block">
                        Paid directly to your courier upon ID verification.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#5A805B] bg-white px-2.5 py-1 rounded-full shadow-2xs">
                    Standard
                  </span>
                </div>

                {/* Age Verification Checkbox */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAgeVerified}
                    onChange={(e) => setIsAgeVerified(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#5A805B] focus:ring-[#5A805B]"
                  />
                  <div className="text-xs leading-relaxed text-neutral-700">
                    <strong className="text-neutral-900">I am 21+ years old: </strong>
                    I confirm that I have a valid government-issued photo ID (Driver&apos;s License, State ID, or Passport) to present upon delivery or pickup. Initiative 71 Compliant.
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-full bg-[#5A805B] hover:bg-[#4d704e] disabled:opacity-60 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing Your Order...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Place Order · ${finalTotal.toFixed(2)}</span>
                  </>
                )}
              </button>
            </form>

            {/* ================= RIGHT COLUMN: ORDER SUMMARY ================= */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="font-extrabold text-lg text-neutral-900">
                    Order Summary
                  </h3>
                  <span className="text-xs font-bold bg-[#5A805B]/10 text-[#5A805B] px-2.5 py-0.5 rounded-full">
                    {totalCount} {totalCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items list */}
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1 divide-y divide-neutral-100">
                  {items.map((it) => (
                    <div key={`${it.id}-${it.weight}`} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-[#5A805B]/10 p-1 shrink-0 overflow-hidden">
                        <Image
                          src={
                            typeof it.image === "string" && it.image.trim() !== ""
                              ? it.image
                              : (it.image as any)?.url || "/images/placeholder-product.png"
                          }
                          alt={it.name}
                          fill
                          sizes="48px"
                          className="object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                          {it.name}
                        </h4>
                        <p className="text-[11px] text-neutral-500 font-medium">
                          {it.weight ? `${it.weight} · ` : ""}Qty: {it.quantity}
                        </p>
                      </div>
                      <span className="font-black text-xs sm:text-sm text-neutral-900">
                        ${(it.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Box */}
                <div className="pt-2">
                  {appliedCoupon ? (
                    <div className="p-3 rounded-2xl bg-[#5A805B]/10 border border-[#5A805B]/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#5A805B]" />
                        <div>
                          <span className="font-mono font-bold text-[#5A805B]">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[11px] text-neutral-600 block">
                            ${appliedCoupon.discountAmount.toFixed(2)} discount applied
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-neutral-400 hover:text-rose-600 p-1 rounded cursor-pointer transition"
                        title="Remove coupon"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Promo code (e.g. TORCH10)"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-mono font-bold uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5A805B] transition"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={isApplyingPromo || !promoCode.trim()}
                          className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
                        >
                          {isApplyingPromo ? "..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cost breakdown */}
                <div className="pt-3 border-t border-neutral-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                    <div className="flex justify-between text-[#5A805B] font-semibold">
                      <span>Promo Discount ({appliedCoupon.code})</span>
                      <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>DC Delivery</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-neutral-200 text-sm">
                    <span className="font-black text-neutral-900">Total</span>
                    <span className="font-black text-xl text-[#5A805B]">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Trust perks */}
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                    <Clock className="w-4 h-4 text-[#5A805B] shrink-0" />
                    <span>Estimated arrival: 35-45 minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                    <ShieldCheck className="w-4 h-4 text-[#557754] shrink-0" />
                    <span>21+ government ID verified at door</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                    <Phone className="w-4 h-4 text-[#557754] shrink-0" />
                    <span>Order support: (202) 468-1966</span>
                  </div>
                </div>
              </div>

              {/* Add to your order suggestions */}
              <CartAddToOrder compact={true} className="pt-2" />
            </div>
          </div>
        )}
      </main>

      {/* Customer Auth Modal for returning shoppers */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
