/**
 * Full-bleed light page for the mobile-first admin screens (Today, Orders, Order details).
 * Cancels AdminShell's main padding so the screens reach the phone edges as designed.
 */
export function LightSurface({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`admin-light -m-4 min-h-[calc(100vh-4rem)] md:-m-8 ${className}`}>{children}</div>;
}
