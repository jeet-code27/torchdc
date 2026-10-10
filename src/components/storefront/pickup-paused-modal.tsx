"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useCart } from "@/context/cart-context";

interface PickupPausedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function PickupPausedModal({
  isOpen,
  onClose,
  title = "Pickup is paused right now",
  message = "We'll deliver it free, with a pre-roll on us.",
}: PickupPausedModalProps) {
  const { setFulfillment } = useCart();

  // Handle ESC key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSwitchToDelivery = () => {
    setFulfillment("delivery", true); // force switch
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card - Exact Match to Screenshot */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pickup-paused-title"
        className="relative w-full max-w-[420px] bg-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 text-center shadow-2xl z-10 animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title with Red Pulsing Dot */}
        <div className="flex items-center justify-center gap-2.5 mt-2">
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]"></span>
          </span>
          <h3
            id="pickup-paused-title"
            className="font-extrabold text-[20px] sm:text-[23px] text-neutral-900 tracking-tight leading-snug"
          >
            {title}
          </h3>
        </div>

        {/* Subtitle Message */}
        <p className="text-[14px] sm:text-[15px] text-neutral-600 mt-2.5 leading-relaxed">
          We&apos;ll deliver it <strong className="font-extrabold text-neutral-900">free</strong>, with a{" "}
          <strong className="font-extrabold text-neutral-900">pre-roll on us</strong>.
        </p>

        {/* Action Button: SWITCH TO DELIVERY */}
        <button
          type="button"
          onClick={handleSwitchToDelivery}
          className="w-full mt-7 py-3.5 px-6 rounded-full bg-[#5A805B] hover:bg-[#476748] active:scale-95 text-white font-extrabold text-[13px] sm:text-[14px] tracking-wider uppercase shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          SWITCH TO DELIVERY
        </button>
      </div>
    </div>
  );
}
