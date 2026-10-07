"use client";

import { Toaster } from "react-hot-toast";

export function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: "!bg-card !text-card-foreground !border !border-border !shadow-md !rounded-lg !text-sm",
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          padding: "12px 16px",
          borderRadius: "8px",
        },
        success: {
          iconTheme: {
            primary: "#5A805B",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
