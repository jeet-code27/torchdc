"use client";

import * as React from "react";
import Image from "next/image";
import { X, Eye, EyeOff, Lock, Mail, Phone, User, CheckCircle2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useCart } from "@/context/cart-context";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
  onSuccess?: () => void;
}

export function CustomerAuthModal({
  isOpen,
  onClose,
  defaultMode = "signin",
  onSuccess,
}: CustomerAuthModalProps) {
  const [mode, setMode] = React.useState<"signin" | "signup">(defaultMode);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const { sessionId, mergeSessionCart } = useCart();

  // Sign In Form States
  const [signInIdentifier, setSignInIdentifier] = React.useState("");
  const [signInPassword, setSignInPassword] = React.useState("");

  // Sign Up Form States
  const [signUpName, setSignUpName] = React.useState("");
  const [signUpEmail, setSignUpEmail] = React.useState("");
  const [signUpPhone, setSignUpPhone] = React.useState("");
  const [signUpPassword, setSignUpPassword] = React.useState("");

  React.useEffect(() => {
    setMode(defaultMode);
    setErrorMessage("");
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  // Handle smart phone formatting: supports (XXX) XXX-XXXX, pastes with +1 or without
  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, "");
    // If user pasted or typed with leading 1 for US, strip it if 11 digits
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
    setSignUpPhone(formatted);
  };

  const phoneDigits = signUpPhone.replace(/\D/g, "");
  const isPhoneComplete = phoneDigits.length === 10;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail.trim());
  const isNameValid = signUpName.trim().length >= 2;

  // Handle Sign In Submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!signInIdentifier.trim()) {
      setErrorMessage("Please enter your email or phone number.");
      return;
    }
    if (!signInPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: signInIdentifier.trim(),
        password: signInPassword,
      });

      if (res?.error) {
        setErrorMessage("Invalid email, phone, or password. Please try again.");
      } else {
        toast.success("Welcome back to Torch!");
        if (sessionId) {
          await mergeSessionCart();
        }
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!signUpName.trim() || signUpName.trim().length < 2) {
      setErrorMessage("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!signUpEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!isPhoneComplete) {
      setErrorMessage("Please enter a valid 10-digit mobile number (e.g. (202) 555-0143).");
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpName.trim(),
          email: signUpEmail.trim().toLowerCase(),
          phone: signUpPhone.trim(),
          password: signUpPassword,
          sessionId,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      // Auto sign in with created credentials
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
      });

      if (signInRes?.error) {
        toast.success("Account created! Please sign in.");
        setMode("signin");
        setSignInIdentifier(signUpEmail);
      } else {
        toast.success("Welcome to Torch! Account created successfully.");
        if (sessionId) {
          await mergeSessionCart();
        }
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage("Could not connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-zinc-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Original Black Torch Logo */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="relative w-44 h-12 mx-auto mb-3">
            <Image
              src="/images/torch-logo.svg"
              alt="Torch"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            {mode === "signin" ? "Welcome Back to Torch" : "Create Your Torch Account"}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {mode === "signin"
              ? "Sign in with your email or phone number to track orders & checkout faster"
              : "Register with your name, email & verified mobile number"}
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="px-6 pb-2">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage("");
              }}
              className={`py-2 rounded-lg transition ${
                mode === "signin"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
              }}
              className={`py-2 rounded-lg transition ${
                mode === "signup"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Alert with Smart Quick Actions */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="font-medium flex-1">{errorMessage}</span>
            </div>

            {/* Smart 1-click action if user already exists */}
            {mode === "signup" && errorMessage.toLowerCase().includes("already exists") && (
              <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                <span className="text-[11px] text-rose-700">Already registered?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setSignInIdentifier(signUpEmail || signUpPhone);
                    setErrorMessage("");
                  }}
                  className="text-[11px] font-bold text-rose-900 underline hover:text-black cursor-pointer"
                >
                  Switch to Sign In →
                </button>
              </div>
            )}

            {/* Smart 1-click action if account not found during sign in */}
            {mode === "signin" && errorMessage.toLowerCase().includes("invalid") && (
              <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                <span className="text-[11px] text-rose-700">Don&apos;t have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    if (signInIdentifier.includes("@")) {
                      setSignUpEmail(signInIdentifier);
                    } else if (signInIdentifier.replace(/\D/g, "").length >= 7) {
                      setSignUpPhone(signInIdentifier);
                    }
                    setErrorMessage("");
                  }}
                  className="text-[11px] font-bold text-rose-900 underline hover:text-black cursor-pointer"
                >
                  Create an account →
                </button>
              </div>
            )}
          </div>
        )}

        {/* FORM CONTENT */}
        <div className="p-6 pt-3">
          {mode === "signin" ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  {signInIdentifier.replace(/\D/g, "").length >= 7 ? (
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A805B]" />
                  ) : (
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  )}
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="name@example.com or (202) 555-0143"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#5A805B] focus:ring-1 focus:ring-[#5A805B] transition"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Sign in using your registered email address or phone number
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#5A805B] focus:ring-1 focus:ring-[#5A805B] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#5A805B] hover:bg-[#4d704e] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            /* ================= SIGN UP FORM ================= */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  {isNameValid && (
                    <span className="text-[10px] text-[#5A805B] font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Valid
                    </span>
                  )}
                </div>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#5A805B] focus:ring-1 focus:ring-[#5A805B] transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  {isEmailValid && (
                    <span className="text-[10px] text-[#5A805B] font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Valid Email
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#5A805B] focus:ring-1 focus:ring-[#5A805B] transition"
                  />
                </div>
              </div>

              {/* Mobile Phone (with +1 prefix & live validation) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-700">
                    Mobile Number (Washington DC) <span className="text-rose-500">*</span>
                  </label>
                  {isPhoneComplete ? (
                    <span className="text-[10px] text-[#5A805B] font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verified 10 Digits
                    </span>
                  ) : phoneDigits.length > 0 ? (
                    <span className="text-[10px] text-amber-600 font-medium">
                      {10 - phoneDigits.length} digits left
                    </span>
                  ) : null}
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-zinc-500 font-semibold text-xs pointer-events-none pr-2 border-r border-zinc-200">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>+1</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={signUpPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(202) 555-0143"
                    maxLength={14}
                    className={`w-full pl-16 pr-4 py-2.5 rounded-xl border text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition ${
                      isPhoneComplete
                        ? "border-[#5A805B] ring-1 ring-[#5A805B]/30"
                        : phoneDigits.length > 0
                        ? "border-amber-300"
                        : "border-zinc-300 focus:border-[#5A805B] focus:ring-1 focus:ring-[#5A805B]"
                    }`}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
                  <span>10-digit number for order delivery & driver dispatch</span>
                  {phoneDigits.length > 0 && (
                    <span className="font-mono text-zinc-400">{phoneDigits.length}/10</span>
                  )}
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#5A805B] focus:ring-1 focus:ring-[#5A805B] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#5A805B] hover:bg-[#4d704e] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <span>Register & Continue</span>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-4 pt-4 border-t border-zinc-100 text-center">
            <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5A805B]" />
              <span>Initiative 71 Compliant · 21+ Age Verification Required</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
