'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Pull down + let go to refresh (owner-approved, design board "6. Pull to refresh"),
 * plus auto-refresh every `intervalMs` while open and whenever the app comes back to the foreground.
 *
 * Wrap the Dashboard and Orders page content:
 *   <PullToRefresh onRefresh={refetch}> ... </PullToRefresh>
 * `onRefresh` defaults to router.refresh() (re-runs server components). Pass your own if the page
 * fetches on the client. It should resolve when fresh data is in.
 *
 * Only active in the installed home-screen app (standalone), where iPhone has no built-in pull-to-refresh.
 * In normal Safari/Chrome tabs the browser's own pull-to-refresh is left alone.
 */

const TRIGGER = 72; // px of pull needed to refresh
const MAX = 110;

export type PullToRefreshProps = {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  intervalMs?: number; // 0 disables timed auto-refresh
};

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function relative(ts: number | null, now: number) {
  if (!ts) return '';
  const s = Math.round((now - ts) / 1000);
  if (s < 45) return 'Updated just now';
  const m = Math.round(s / 60);
  return m < 60 ? `Updated ${m} min ago` : 'Updated over an hour ago';
}

export default function PullToRefresh({ children, onRefresh, intervalMs = 30_000 }: PullToRefreshProps) {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [enabled, setEnabled] = useState(false);
  const startY = useRef<number | null>(null);
  const busy = useRef(false);
  const pullRef = useRef(0);
  const setPullBoth = (v: number) => {
    pullRef.current = v;
    setPull(v);
  };

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      else {
        router.refresh();
        await new Promise((r) => setTimeout(r, 600)); // router.refresh has no completion promise
      }
      setUpdatedAt(Date.now());
    } finally {
      busy.current = false;
      setRefreshing(false);
      setPullBoth(0);
    }
  }, [onRefresh, router]);

  useEffect(() => {
    setEnabled(isStandalone());
    setUpdatedAt(Date.now());
  }, []);

  // Auto-refresh: on an interval while visible, and when the app returns to the foreground.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    const tick = setInterval(() => {
      setNow(Date.now());
      if (intervalMs && document.visibilityState === 'visible') refresh();
    }, intervalMs || 30_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(tick);
    };
  }, [intervalMs, refresh]);

  // Touch handling (passive: false on move so we can stop the page bouncing while pulling).
  useEffect(() => {
    if (!enabled) return;
    const onStart = (e: TouchEvent) => {
      startY.current = window.scrollY <= 0 && !busy.current ? e.touches[0].clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setPullBoth(0);
        return;
      }
      if (e.cancelable) e.preventDefault();
      setPullBoth(Math.min(MAX, dy * 0.5)); // resistance
    };
    const onEnd = () => {
      if (startY.current == null) return;
      startY.current = null;
      if (pullRef.current >= TRIGGER) refresh();
      else setPullBoth(0);
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled, refresh]);

  const ready = pull >= TRIGGER;
  const height = refreshing ? 64 : pull;
  const label = refreshing ? 'Refreshing…' : ready ? 'Release to refresh' : pull > 8 ? 'Pull to refresh' : '';

  return (
    <div>
      <div
        aria-live="polite"
        className="flex flex-col items-center justify-end gap-1.5 overflow-hidden bg-[#f5f9f5] font-[Jost,system-ui,sans-serif]"
        style={{ height, paddingBottom: height ? 8 : 0, transition: startY.current == null ? 'height .2s ease' : 'none' }}
      >
        {height > 0 && (
          <>
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              {refreshing ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3f6b40" strokeWidth={2.6} strokeLinecap="round" aria-hidden>
                  <path d="M21 12a9 9 0 1 1-6.2-8.6" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3f6b40"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  style={{ transform: `rotate(${ready ? 180 : 0}deg)`, transition: 'transform .2s ease' }}
                >
                  <path d="M12 5v14" />
                  <path d="M6 13l6 6 6-6" />
                </svg>
              )}
            </span>
            <span className="text-[13px] font-semibold text-[#3f5e3c]">{label}</span>
          </>
        )}
      </div>
      <p className="m-0 px-4 pt-2 text-right text-xs text-[#71717a]">{relative(updatedAt, now)}</p>
      {children}
    </div>
  );
}
