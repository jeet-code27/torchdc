"use client";

import * as React from "react";

function getIsDCOpen(): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
    });
    const hourStr = formatter.format(new Date());
    const hour = parseInt(hourStr, 10);
    // Washington D.C. hours: Open 7:00 AM (07) to 11:00 PM (23)
    return hour >= 7 && hour < 23;
  } catch {
    const hour = new Date().getHours();
    return hour >= 7 && hour < 23;
  }
}

export function StoreStatusbar() {
  const [isOpen, setIsOpen] = React.useState<boolean>(getIsDCOpen);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const check = () => setIsOpen(getIsDCOpen());
    check();
    const interval = setInterval(check, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // When not yet mounted, use initial getIsDCOpen result to prevent hydration flash
  const openStatus = mounted ? isOpen : getIsDCOpen();

  if (!openStatus) {
    return (
      <div className="w-full bg-[#fdf3f2] text-[#93372c] border-b border-[#fbdcd9] text-xs py-1.5 px-4 font-medium transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          <span className="font-bold">Closed now</span>
          <span className="text-[#93372c]/60">·</span>
          <span>Order ahead, we open at 7AM</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#EBF3EA] text-[#3D5B3C] border-b border-[#D8E6D7] text-xs py-1.5 px-4 font-medium transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <span className="font-bold">Open now</span>
        <span className="text-emerald-700/60">•</span>
        <span>Delivering in about 35 to 45 min</span>
        <span className="text-emerald-700/60">•</span>
        <span>Until 11PM</span>
      </div>
    </div>
  );
}

export const StoreStatusBar = StoreStatusbar;
