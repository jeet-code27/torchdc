"use client";

import * as React from "react";
import { Menu, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface TopbarProps {
  onToggleMobile: () => void;
}

export function AdminTopbar({ onToggleMobile }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-8 transition-colors">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobile}
          className="md:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Admin Portal
          </span>
          <span className="text-xs text-muted-foreground">
            Washington DC Store
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick notification test */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toast.success("Notification system active", { id: "test-toast" })}
          aria-label="Notifications"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </Button>

        {/* Theme toggle: light, dark, system */}
        <ThemeToggle />

        <div className="h-5 w-[1px] bg-border mx-1" />

        {/* User profile & session dropdown */}
        <AdminUserMenu />
      </div>
    </header>
  );
}
