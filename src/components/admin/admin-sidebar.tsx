"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Tag,
  Percent,
  Users,
  Award,
  FileText,
  Globe,
  ShieldCheck,
  History,
  ChevronDown,
  X,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionKey } from "@/types";

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavEntry {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: PermissionKey;
  children?: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: PermissionKey;
  }[];
}

const navItems: NavEntry[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    permission: "orders.view",
  },
  {
    title: "Catalog",
    icon: Package,
    children: [
      {
        title: "Products",
        href: "/admin/products",
        icon: Package,
        permission: "products.view",
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
        permission: "categories.view",
      },
    ],
  },
  {
    title: "Deals & Coupons",
    href: "/admin/deals",
    icon: Percent,
    permission: "deals.view",
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
    permission: "customers.view",
  },
  {
    title: "Loyalty",
    href: "/admin/loyalty",
    icon: Award,
    permission: "loyalty.view",
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
    permission: "blogs.view",
  },
  {
    title: "SEO",
    href: "/admin/seo",
    icon: Globe,
    permission: "seo.view",
  },
  {
    title: "Staff & Roles",
    href: "/admin/staff",
    icon: ShieldCheck,
    permission: "staff.view",
  },
  {
    title: "Activity Log",
    href: "/admin/activity",
    icon: History,
    permission: "activity.view",
  },
];

export function AdminSidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [catalogOpen, setCatalogOpen] = React.useState(true);

  // Auto-expand catalog if currently viewing a catalog route
  React.useEffect(() => {
    if (
      pathname.startsWith("/admin/products") ||
      pathname.startsWith("/admin/categories")
    ) {
      setCatalogOpen(true);
    }
  }, [pathname]);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-sidebar-border">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md py-1"
          title="TORCH Admin Portal"
        >
          <Image
            src="/images/torch-logo.svg"
            alt="TORCH"
            width={140}
            height={36}
            priority
            className="h-9 w-auto max-w-[140px] object-contain drop-shadow-xs"
          />
        </Link>
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          // If top-level permission check fails, hide
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }

          // If item has children (Catalog)
          if (item.children) {
            const hasVisibleChild = item.children.some(
              (child) => !child.permission || hasPermission(child.permission)
            );
            if (!hasVisibleChild) return null;

            const isAnyChildActive = item.children.some(
              (child) => pathname === child.href || pathname.startsWith(child.href + "/")
            );

            return (
              <div key={item.title} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setCatalogOpen((prev) => !prev)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isAnyChildActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      catalogOpen && "rotate-180"
                    )}
                  />
                </button>

                {catalogOpen && (
                  <div className="pl-6 space-y-1 pt-1">
                    {item.children.map((child) => {
                      if (child.permission && !hasPermission(child.permission)) {
                        return null;
                      }
                      const isActive =
                        pathname === child.href || pathname.startsWith(child.href + "/");

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onCloseMobile}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <child.icon className="h-3.5 w-3.5" />
                          <span>{child.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single navigation item
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || (item.href && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href || item.title}
              href={item.href || "#"}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-[11px] text-muted-foreground text-center">
          TORCH Admin Panel • v1.0
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
