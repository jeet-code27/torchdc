"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Check, RefreshCw } from "lucide-react";

const STORAGE_KEY = "torch_age_verified";
const COOKIE_NAME = "torch_21";
const EXPIRY_DAYS = 30;

export function StoreAgeGate() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<"ask" | "no">("ask");
  const [remember, setRemember] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  // Check verification state on mount
  React.useEffect(() => {
    setMounted(true);

    // Skip age gate entirely on admin and API routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      setIsOpen(false);
      return;
    }

    try {
      // 1. Check Cookie
      const hasCookie = document.cookie
        .split("; ")
        .some((row) => row.startsWith(`${COOKIE_NAME}=1`));

      // 2. Check localStorage with 30-day expiration
      const localData = localStorage.getItem(STORAGE_KEY);
      let isLocalValid = false;
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed.verified && parsed.expiresAt > Date.now()) {
            isLocalValid = true;
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          if (localData === "true") isLocalValid = true;
        }
      }

      // 3. Check sessionStorage
      const sessionData = sessionStorage.getItem(STORAGE_KEY) === "true";

      if (!hasCookie && !isLocalValid && !sessionData) {
        setIsOpen(true);
        document.body.style.overflow = "hidden";
      }
    } catch {
      // Fallback for sandboxed iframes
      setIsOpen(true);
    }
  }, [pathname]);

  // Clean up overflow on unmount
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleConfirmAge = () => {
    try {
      if (remember) {
        const expiresAt = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ verified: true, expiresAt })
        );
        // Set cookie for 30 days
        const date = new Date();
        date.setTime(date.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        document.cookie = `${COOKIE_NAME}=1; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
      } else {
        sessionStorage.setItem(STORAGE_KEY, "true");
        document.cookie = `${COOKIE_NAME}=1; path=/; SameSite=Lax`;
      }
    } catch (err) {
      console.warn("Storage error saving age verification", err);
    }

    setIsOpen(false);
    document.body.style.overflow = "";
  };

  const handleRejectAge = () => {
    setStep("no");
  };

  const handleRetry = () => {
    setStep("ask");
  };

  // Do not render anything server-side or if closed or on admin pages
  if (!mounted || !isOpen || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agegate-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#3d593e]/95 backdrop-blur-md animate-in fade-in duration-300"
    >
      {/* Background Decorative Weed Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 bg-repeat"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 w-full max-w-[390px] flex flex-col items-center">
        {step === "ask" ? (
          /* STEP 1: VERIFICATION PROMPT */
          <div className="w-full bg-white rounded-[28px] p-7 md:p-8 text-center shadow-2xl flex flex-col items-center border border-emerald-100/40 animate-in zoom-in-95 duration-200">
            {/* 1. Torch Logo */}
            <div className="relative w-36 h-12 mb-3">
              <Image
                src="/images/torch-logo.svg"
                alt="Torch Dispensary"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* 2. Solid Orange 21+ Badge */}
            <span className="inline-block bg-[#E8561E] text-white text-[11px] font-black tracking-wider uppercase px-3.5 py-1 rounded-full mb-3 shadow-sm">
              21+ ONLY
            </span>

            {/* 3. Heading */}
            <h2
              id="agegate-title"
              className="text-[25px] md:text-[27px] font-black text-neutral-900 tracking-tight leading-tight mb-2.5"
            >
              Are you 21 or older?
            </h2>

            {/* 4. Subtitle */}
            <p className="text-[13px] md:text-[14px] text-neutral-600 leading-relaxed max-w-[290px] mb-6">
              You must be 21+ to shop Torch. A valid government ID is checked at
              delivery or pickup.
            </p>

            {/* 5. Primary Confirmation Button */}
            <button
              type="button"
              onClick={handleConfirmAge}
              className="w-full bg-[#557754] hover:bg-[#466645] active:scale-[0.99] text-white font-black py-3.5 px-6 rounded-full text-[14px] uppercase tracking-wider transition-all shadow-md shadow-[#557754]/20 hover:shadow-lg hover:shadow-[#557754]/30 cursor-pointer"
            >
              YES, I&apos;M 21+
            </button>

            {/* 6. Secondary Rejection Button */}
            <button
              type="button"
              onClick={handleRejectAge}
              className="w-full bg-white hover:bg-neutral-50 active:scale-[0.99] text-neutral-800 font-bold py-3 px-6 rounded-full border border-neutral-300 text-[14px] transition-all cursor-pointer mt-2.5"
            >
              No, I&apos;m under 21
            </button>

            {/* 7. Remember me for 30 days */}
            <label className="flex items-center justify-center gap-2.5 mt-4 cursor-pointer text-[13px] text-neutral-700 select-none group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-[#557754] accent-[#557754] cursor-pointer"
              />
              <span className="group-hover:text-neutral-900 transition-colors">
                Remember me for 30 days
              </span>
            </label>

            {/* 8. Fine legal notice */}
            <p className="text-[11px] text-neutral-400 mt-4 leading-normal">
              By entering you agree to our{" "}
              <Link
                href="/terms-conditions"
                className="underline hover:text-neutral-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="underline hover:text-neutral-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        ) : (
          /* STEP 2: REJECTION PROMPT */
          <div className="w-full bg-white rounded-[28px] p-7 md:p-8 text-center shadow-2xl flex flex-col items-center border border-red-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h2 className="text-[22px] font-black text-neutral-900 tracking-tight mb-2">
              Sorry, you must be 21 or older
            </h2>

            <p className="text-[13px] text-neutral-600 leading-relaxed mb-6">
              Come back when you&apos;re 21. Initiative 71 and Washington D.C. laws
              strictly require all patrons to be 21+. Thanks for understanding.
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="w-full bg-neutral-100 hover:bg-neutral-200 active:scale-[0.99] text-neutral-800 font-bold py-3 px-6 rounded-full border border-neutral-300 text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              I entered the wrong answer
            </button>
          </div>
        )}

        {/* Bottom Banner Outside Card */}
        <p className="text-white/85 text-[12px] font-medium mt-6 drop-shadow text-center">
          Free same-day delivery across Washington, DC
        </p>
      </div>
    </div>
  );
}
