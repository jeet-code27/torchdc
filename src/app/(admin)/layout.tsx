import type { Metadata } from "next";
import { AdminToaster } from "@/components/admin/admin-toaster";
import { AdminShell } from "@/components/admin/admin-shell";
import { SessionProvider } from "@/components/auth/session-provider";

export const metadata: Metadata = {
  title: "TORCH Admin",
  description: "TORCH Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
      <AdminToaster />
    </SessionProvider>
  );
}
