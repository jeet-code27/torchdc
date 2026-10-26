"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      aria-labelledby="age-title"
      id="agegate"
      className={`agegate ${isOpen ? "is-open" : ""}`}
    >
      <div className="agegate__card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/img/logo.webp" alt="Torch" />

        {/* Oct 24 design: frosted page behind, "Are You 21+?", two short lines, slim centered buttons, toggle */}
        <div className="agegate__ask" hidden={step !== "ask"}>
          <p className="agegate__h" id="age-title">Are You 21+?</p>
          <p>
            <span>You must be 21 or older to enter.</span> <span>A valid ID is required with every order.</span>
          </p>
          <button className="btn-wide" type="button" onClick={handleConfirmAge}>
            Yes, I&apos;m 21+
          </button>
          <button className="btn-wide btn-wide--ghost" type="button" onClick={handleRejectAge}>
            No, I&apos;m under 21
          </button>
          <label className="agegate__rem">
            <input
              id="age-remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />{" "}
            Remember me for 30 days
          </label>
        </div>
        <div className="agegate__no" hidden={step !== "no"}>
          <p className="agegate__h">Sorry, you must be 21 or older</p>
          <p>Come back when you&apos;re 21. Thanks for understanding.</p>
          <button className="btn-wide btn-wide--ghost" type="button" onClick={handleRetry}>
            I entered the wrong answer
          </button>
        </div>
        {/* Shown under both steps, like the client site */}
        <small>
          By entering you agree to our{" "}
          <Link href="/terms-conditions" onClick={() => setIsOpen(false)}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" onClick={() => setIsOpen(false)}>
            Privacy Policy
          </Link>
          .
        </small>
      </div>
    </div>
  );
}
