import * as React from "react";

export function StoreDeliverySteps() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-[#edf4ec] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-10 border border-[#deebd9]">
        {/* Section Heading */}
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-8">
          Delivery in 3 easy steps
        </h2>

        {/* Steps Container */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Desktop Connecting Line behind steps */}
          <div className="hidden md:block absolute top-5 left-[15%] right-[15%] h-[2px] bg-[#d3e3ce] z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-start md:items-start space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#557754] text-white font-black text-sm flex items-center justify-center shadow-xs">
              1
            </div>
            <h3 className="text-base font-extrabold text-gray-900 pt-1">
              Pick your products
            </h3>
            <p className="text-xs sm:text-[13px] text-gray-600 font-medium leading-relaxed">
              Order online in a few clicks, or call us.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-start md:items-start space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#557754] text-white font-black text-sm flex items-center justify-center shadow-xs">
              2
            </div>
            <h3 className="text-base font-extrabold text-gray-900 pt-1">
              Get your ETA by text
            </h3>
            <p className="text-xs sm:text-[13px] text-gray-600 font-medium leading-relaxed">
              Most orders arrive in 35 to 45 min.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-start md:items-start space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#ea5825] text-white font-black text-sm flex items-center justify-center shadow-xs">
              3
            </div>
            <h3 className="text-base font-extrabold text-gray-900 pt-1">
              Show your ID at the door
            </h3>
            <p className="text-xs sm:text-[13px] text-gray-600 font-medium leading-relaxed">
              21+ with a valid government ID. That&apos;s it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
