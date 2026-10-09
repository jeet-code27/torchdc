"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Shield, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export function AdminUserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    toast.loading("Signing out...");
    await signOut({ redirect: false });
    window.location.href = "/admin/login";
  };

  const user = session?.user;
  const name = user?.name || "Admin";
  const email = user?.email || "admin@torch.com";
  const role = user?.role || "super_admin";

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AD";

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-muted transition-colors text-left"
        aria-label="User navigation menu"
      >
        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-xs border border-primary/25">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-semibold leading-none text-foreground">
            {name}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 leading-none truncate max-w-[140px]">
            {email}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card p-1.5 shadow-lg z-50 text-card-foreground animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-xs font-semibold text-foreground">{name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
              <Shield className="w-3 h-3" />
              <span>{role}</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => {
                toast("Profile management available in Step 3", { icon: "ℹ️" });
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md text-foreground hover:bg-muted transition-colors text-left"
            >
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Admin Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md text-destructive hover:bg-destructive/10 transition-colors text-left font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
