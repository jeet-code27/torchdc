"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Flame, Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@torch.com",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const toastId = toast.loading("Verifying credentials...");

    try {
      const res = await signIn("credentials", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        portal: "admin",
        redirect: false,
      });

      if (!res || res.error) {
        toast.error(
          res?.error || "Invalid staff email or password. Access restricted to authorized personnel.",
          { id: toastId }
        );
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back! Redirecting to dashboard...", {
        id: toastId,
      });
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred during login", {
        id: toastId,
      });
      setIsLoading(false);
    }
  };

  const fillSuperAdmin = () => {
    setValue("email", "admin@torch.com");
    setValue("password", "TorchAdminPassword123!");
    toast("Default super admin credentials filled", { icon: "🔑" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center mb-1">
            <Image
              src="/images/torch-logo.svg"
              alt="TORCH"
              width={220}
              height={64}
              priority
              className="h-16 w-auto max-w-[220px] object-contain drop-shadow-sm dark:hidden"
            />
            <Image
              src="/images/torch-logo-white.svg"
              alt="TORCH"
              width={220}
              height={64}
              priority
              className="h-16 w-auto max-w-[220px] object-contain drop-shadow-sm hidden dark:block"
            />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Admin Portal • Washington DC
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-7 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Sign In</h2>
            <p className="text-xs text-muted-foreground">
              Enter your credentials to access the management portal.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-foreground block"
              >
                Staff Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@torch.com"
                  disabled={isLoading}
                  {...register("email")}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.email ? "border-destructive" : "border-input"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-foreground block"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  {...register("password")}
                  className={`w-full pl-9 pr-10 py-2 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.password ? "border-destructive" : "border-input"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 h-10 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Seed hint helper button */}
          <div className="pt-2 border-t border-border">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-foreground block">
                  Demo Super Admin
                </span>
                <span className="text-[11px] text-muted-foreground">
                  admin@torch.com
                </span>
              </div>
              <button
                type="button"
                onClick={fillSuperAdmin}
                className="text-xs text-primary font-medium hover:underline px-2 py-1 rounded hover:bg-primary/10 transition-colors"
              >
                Auto-fill
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Protected area • Authorized TORCH personnel only
        </p>
      </div>
    </div>
  );
}
