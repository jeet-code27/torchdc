"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  LogOut,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { CustomerAuthModal } from "@/components/storefront/customer-auth-modal";

interface CustomerOrder {
  _id: string;
  orderNumber: string;
  fulfillment: "delivery" | "pickup";
  orderStatus:
    | "pending"
    | "confirmed"
    | "out_for_delivery"
    | "ready_for_pickup"
    | "completed"
    | "cancelled";
  subtotal: number;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    weight?: string;
    image?: string;
  }>;
  createdAt: string;
}

export default function CustomerAccountPage() {
  const { data: session, status } = useSession();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [orders, setOrders] = React.useState<CustomerOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(true);

  const isCustomer = Boolean(session?.user && session.user.role === "customer");
  const isAdminStaff = Boolean(
    session?.user && session.user.role && session.user.role !== "customer"
  );

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  React.useEffect(() => {
    if (isCustomer) {
      setIsLoadingOrders(true);
      fetch("/api/customer/orders")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.orders || []);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingOrders(false));
    } else {
      setIsLoadingOrders(false);
    }
  }, [isCustomer]);

  const getStatusBadge = (status: CustomerOrder["orderStatus"]) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case "out_for_delivery":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Out for Delivery
          </span>
        );
      case "ready_for_pickup":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Ready for Pickup
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {status === "loading" ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-[#5A805B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400 font-medium">Loading your profile...</p>
            </div>
          ) : !session?.user ? (
            /* Logged Out Screen */
            <div className="bg-white rounded-3xl p-10 border border-gray-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#5A805B]/10 text-[#5A805B] flex items-center justify-center mx-auto">
                <User className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sign In to Your Account</h1>
              <p className="text-xs text-gray-500">
                Track your past orders, manage your verified DC mobile number, and enjoy seamless one-click ordering.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full py-3 rounded-xl bg-[#5A805B] hover:bg-[#4d704e] text-white font-bold text-xs uppercase tracking-wider shadow transition cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>
          ) : isAdminStaff ? (
            /* Admin Logged In Screen on Storefront */
            <div className="bg-white rounded-3xl p-10 border border-zinc-200 text-center space-y-5 max-w-md mx-auto shadow-sm animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-[#5A805B] flex items-center justify-center mx-auto shadow">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Staff Role: {session.user.role}
                </span>
                <h1 className="text-2xl font-extrabold text-zinc-900 mt-2">
                  Admin Account Active
                </h1>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  You are currently logged in with staff credentials (
                  <span className="font-semibold text-zinc-800">{session.user.email}</span>
                  ). Customer orders, personal cart, and customer accounts are separate from the Admin Portal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link
                  href="/admin"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#5A805B] hover:bg-[#4d704e] text-white font-bold text-xs uppercase tracking-wider text-center transition shadow"
                >
                  Go to Admin Portal ↗
                </Link>
                <button
                  onClick={handleSignOut}
                  className="py-3 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Logged In Customer Dashboard */
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#5A805B] text-white flex items-center justify-center text-2xl font-bold uppercase shadow-sm">
                    {session.user.name?.[0] || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-gray-900">
                        {session.user.name}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> 21+ Verified
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{session.user.email}</span>
                      </div>
                      {session.user.phone && (
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                          <Phone className="w-3.5 h-3.5 text-[#5A805B]" />
                          <span>{session.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href="/track-order"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#5A805B]" />
                    <span>Track Order</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#5A805B]" />
                    <span>Your Orders ({orders.length})</span>
                  </h2>
                  <Link
                    href="/shop"
                    className="text-xs font-bold text-[#5A805B] hover:underline"
                  >
                    + Browse Menu
                  </Link>
                </div>

                {isLoadingOrders ? (
                  <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center">
                    <Clock className="w-6 h-6 animate-spin mx-auto text-[#5A805B] mb-2" />
                    <p className="text-xs text-gray-400">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="text-base font-bold text-gray-900">No Orders Yet</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      You haven&apos;t placed any orders yet. Check out our curated topshelf flowers, edibles, and vapes!
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5A805B] text-white font-bold text-xs shadow hover:bg-[#4d704e] transition"
                    >
                      <span>Explore Shop Menu</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((ord) => (
                      <div
                        key={ord._id}
                        className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-[#5A805B]/40 transition space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-bold text-gray-900">
                              {ord.orderNumber}
                            </span>
                            {getStatusBadge(ord.orderStatus)}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(ord.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                              {ord.fulfillment === "delivery" ? (
                                <Truck className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <Store className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              <span className="capitalize">{ord.fulfillment} Order</span>
                              <span>•</span>
                              <span>{ord.items.reduce((s, it) => s + it.quantity, 0)} items</span>
                            </div>
                            <p className="text-xs text-gray-500 max-w-md truncate">
                              {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 block uppercase">Total Due</span>
                              <span className="text-base font-extrabold text-[#5A805B]">
                                ${ord.total.toFixed(2)}
                              </span>
                            </div>

                            <Link
                              href={`/track-order?order=${ord.orderNumber}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5A805B]/10 hover:bg-[#5A805B]/20 text-[#5A805B] text-xs font-bold transition"
                            >
                              <span>Track</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      {/* Auth Modal if triggered */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
