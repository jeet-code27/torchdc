"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { CustomerAuthModal } from "@/components/storefront/customer-auth-modal";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  React.useEffect(() => {
    if (session?.user) {
      if (session.user.role === "super_admin" || session.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAF9]">
      <StoreNavbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {/* Render Customer Auth Modal embedded as the page container */}
        <CustomerAuthModal
          isOpen={true}
          onClose={() => router.push("/")}
          onSuccess={() => router.push("/account")}
        />
      </main>

      <StoreFooter />
    </div>
  );
}
