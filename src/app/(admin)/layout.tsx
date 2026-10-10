import type { Metadata } from "next";
import { AdminToaster } from "@/components/admin/admin-toaster";
import { AdminShell } from "@/components/admin/admin-shell";
import { SessionProvider } from "@/components/auth/session-provider";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "TORCH Admin",
  description: "TORCH Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <AdminShell>{children}</AdminShell>
      <AdminToaster />
    </SessionProvider>
  );
}
