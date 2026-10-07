import * as React from "react";

export function StoreStatusbar() {
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

