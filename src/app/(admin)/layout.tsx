import type { Metadata } from "next";
import { AdminToaster } from "@/components/admin/admin-toaster";
import { AdminShell } from "@/components/admin/admin-shell";
import { SessionProvider } from "@/components/auth/session-provider";
import { auth } from "@/auth";
import "./admin.css";

export const metadata: Metadata = {
  title: "TORCH Admin",
  description: "TORCH Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
  // "Torch Admin" home-screen app: needed for order alerts on iPhone
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Torch Admin", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/assets/img/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/assets/img/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/admin-icons/icon-192.png",
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
