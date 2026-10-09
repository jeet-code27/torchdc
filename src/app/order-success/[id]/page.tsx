import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import {
  CheckCircle,
  Truck,
  Store,
  Clock,
  Phone,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { id } = await params;

  await connectToDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order: any = await Order.findById(id).lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fafbfa] text-neutral-900 pb-20">
      {/* Minimal Header */}
      <header className="bg-white border-b border-neutral-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center py-2" title="Torch Dispensary">
            <Image
              src="/images/torch-logo.svg"
              alt="Torch"
              width={160}
              height={45}
              priority
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
            />
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A805B] hover:underline"
          >
            <span>Browse More Strains</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Success Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-xs text-center space-y-4">
          <div className="w-18 h-18 rounded-full bg-[#5A805B]/10 text-[#5A805B] flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#E8561E] bg-[#fdf1ea] px-3 py-1 rounded-full border border-orange-100">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-2.5">
              Thank You, {order.customer.name}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
              Order #{order.orderNumber} has been received and is being packed.
            </p>
          </div>

          {/* Delivery / ETA Banner */}
          <div className="bg-[#edf4ec] rounded-2xl p-4 sm:p-5 border border-[#deebd9] text-left space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-black text-[#2F4F30]">
              {order.fulfillment === "delivery" ? (
                <Truck className="w-4 h-4 text-[#5A805B]" />
              ) : (
                <Store className="w-4 h-4 text-[#5A805B]" />
              )}
              <span>
                {order.fulfillment === "delivery"
                  ? "Estimated Arrival: 35 to 45 minutes"
                  : "Ready for Curbside Pickup in 15 minutes"}
              </span>
            </div>

            <p className="text-neutral-700">
              {order.fulfillment === "delivery" ? (
                <>
                  Courier dispatched to:{" "}
                  <strong>
                    {order.deliveryAddress?.street}
                    {order.deliveryAddress?.apartment ? `, Apt ${order.deliveryAddress.apartment}` : ""},{" "}
                    {order.deliveryAddress?.city}, DC {order.deliveryAddress?.zip}
                  </strong>
                </>
              ) : (
                <>
                  Pickup Location: <strong>1025 F St NW, Washington, DC 20004</strong>
                </>
              )}
            </p>

            <p className="text-[11px] text-neutral-500 font-medium pt-1">
              Receipt sent to: <strong>{order.customer.email}</strong> · Courier ETA updates sent via SMS to <strong>{order.customer.phone}</strong>
            </p>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-base font-extrabold text-neutral-900">
              Order Summary
            </h2>
            <span className="text-xs font-bold text-neutral-500">
              #{order.orderNumber}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-3 divide-y divide-neutral-100">
            {order.items.map((it: {
              productId: string;
              name: string;
              price: number;
              quantity: number;
              image?: string;
              weight?: string;
            }) => (
              <div key={`${it.productId}-${it.weight}`} className="pt-3 first:pt-0 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-[#edf4ec] p-1 shrink-0 overflow-hidden">
                  <Image
                    src={it.image || "/images/placeholder-product.png"}
                    alt={it.name}
                    fill
                    className="object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                    {it.name}
                  </h3>
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

          {/* Total */}
          <div className="pt-4 border-t border-neutral-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-bold text-neutral-900">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-neutral-200 text-sm">
              <span className="font-black text-neutral-900">
                Total Due ({order.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : "Cash on Pickup"}):
              </span>
              <span className="font-black text-xl text-neutral-900">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-2.5 text-xs text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-[#5A805B] shrink-0" />
            <span>
              Please have exact cash and your 21+ valid government ID ready for the courier.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:flex-1 h-12 rounded-full bg-[#5A805B] hover:bg-[#4d704e] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue to Dispensary Menu</span>
          </Link>

          <a
            href="tel:+12024681966"
            className="w-full sm:w-auto h-12 px-6 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 text-neutral-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all"
          >
            <Phone className="w-4 h-4 text-[#5A805B]" />
            <span>Call Support (202) 468-1966</span>
          </a>
        </div>
      </main>
    </div>
  );
}
