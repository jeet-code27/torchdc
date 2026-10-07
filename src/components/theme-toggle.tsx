"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <Sun className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
        className="rounded-lg text-foreground hover:bg-muted"
      >
        {theme === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : theme === "light" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Monitor className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg border border-border bg-card p-1 shadow-md z-50 text-card-foreground">
          <button
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md transition-colors ${
              theme === "light"
                ? "bg-accent text-accent-foreground font-medium"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-primary" />
            <span>Light</span>
          </button>
          <button
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md transition-colors ${
              theme === "dark"
                ? "bg-accent text-accent-foreground font-medium"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <Moon className="h-3.5 w-3.5 text-primary" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md transition-colors ${
              theme === "system"
                ? "bg-accent text-accent-foreground font-medium"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <Monitor className="h-3.5 w-3.5 text-primary" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
