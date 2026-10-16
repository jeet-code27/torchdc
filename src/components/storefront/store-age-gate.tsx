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

        {step === "ask" ? (
          <div
            className="agegate__ask"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              width: "100%",
            }}
          >
            <span className="tag">21+ ONLY</span>
            <h1 id="age-title">Are you 21 or older?</h1>
            <p>
              You must be 21+ to shop Torch. A valid government ID is checked at
              delivery or pickup.
            </p>
            <button
              className="btn-wide"
              type="button"
              onClick={handleConfirmAge}
              style={{ cursor: "pointer" }}
            >
              YES, I&apos;M 21+
            </button>
            <button
              className="btn-wide btn-wide--ghost"
              type="button"
              onClick={handleRejectAge}
              style={{ cursor: "pointer" }}
            >
              No, I&apos;m under 21
            </button>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#4F5A50",
                minHeight: "44px",
                cursor: "pointer",
              }}
            >
              <input
                id="age-remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  accentColor: "#5A805B",
                  cursor: "pointer",
                }}
              />{" "}
              Remember me for 30 days
            </label>
          </div>
        ) : (
          <div
            className="agegate__no"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              width: "100%",
            }}
          >
            <h1>Sorry, you must be 21 or older</h1>
            <p>Come back when you&apos;re 21. Thanks for understanding.</p>
            <button
              className="btn-wide btn-wide--ghost"
              type="button"
              onClick={handleRetry}
              style={{ cursor: "pointer" }}
            >
              I entered the wrong answer
            </button>
          </div>
        )}
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
