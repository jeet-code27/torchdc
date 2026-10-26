'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { OrderStatus, SetOrderStatus } from '../orders/types';
import { displayOrderNumber, saveErrorText } from '../orders/status';

/**
 * One-tap "Needs attention" (owner-approved, board 1b).
 * - pending order waiting too long  → Confirm · Decline
 * - confirmed order never sent out  → Send out · Complete · Cancel
 * - test orders in the live queue   → Mark all as test
 * Resolved cards disappear; every action has a 5-second Undo; Cancel/Decline ask first.
 */
export type AttentionItem =
  | {
      kind: 'pending' | 'stale';
      orderId: string;
      orderNumber: string;
      status: OrderStatus; // current status, used by Undo
      title: string; // "#1002 new, waiting 12 min"
      detail: string; // "Damian · $220 · Confirmed Oct 22, never sent out"
      href: string;
    }
  | {
      kind: 'tests';
      orderIds: string[];
      title: string; // "4 test orders in the live queue"
      detail: string; // "Test, Tert, Jeetendra (2). Adding $836 to cash to collect"
    };

export type NeedsAttentionProps = {
  items: AttentionItem[];
  setStatus: SetOrderStatus;
  /** Set isTest on orders (true) or clear it (false, used by Undo). */
  setTestFlag: (orderIds: string[], isTest: boolean) => Promise<void>;
};

type Undo = { key: string; text: string; revert: () => Promise<void> } | null;

const keyOf = (it: AttentionItem) => (it.kind === 'tests' ? 'tests' : it.orderId);

export default function NeedsAttention({ items, setStatus, setTestFlag }: NeedsAttentionProps) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Extract<AttentionItem, { orderId: string }> | null>(null);
  const [toast, setToast] = useState<Undo>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const left = items.filter((it) => !resolved.has(keyOf(it)));

  async function run(key: string, action: () => Promise<void>, text: string, revert: () => Promise<void>) {
    setBusy(key);
    setError(null);
    try {
      await action();
      setResolved((cur) => new Set(cur).add(key));
      if (timer.current) clearTimeout(timer.current);
      setToast({ key, text, revert });
      timer.current = setTimeout(() => setToast(null), 5000);
    } catch (err) {
      setError(saveErrorText(err));
    } finally {
      setBusy(null);
    }
  }

  function orderAction(it: Extract<AttentionItem, { orderId: string }>, to: OrderStatus, word: string) {
    const num = displayOrderNumber(it.orderNumber);
    return run(
      it.orderId,
      () => setStatus([it.orderId], to),
      `${num} ${word}`,
      () => setStatus([it.orderId], it.status)
    );
  }

  async function undo() {
    if (!toast) return;
    const t = toast;
    setToast(null);
    try {
      await t.revert();
      setResolved((cur) => {
        const next = new Set(cur);
        next.delete(t.key);
        return next;
      });
    } catch {
      setError("Couldn't undo. Open the order to fix it.");
    }
  }

  const btn = 'h-11 rounded-[10px] text-sm font-semibold disabled:opacity-60';

  return (
    <section className="flex flex-col gap-2.5 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-lg font-bold">Needs attention</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold text-white ${left.length ? 'bg-[#be123c]' : 'bg-[#3f6b40]'}`}>
          {left.length}
        </span>
      </div>

      {error && <p className="rounded-lg bg-[#fff1f2] px-3 py-2 text-sm text-[#be123c]">{error}</p>}

      {left.length === 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-[#dfeadb] bg-[#f3f8f2] px-4 py-5 text-base font-semibold text-[#3f5e3c]">
          ✓ All caught up
        </div>
      )}

      {left.map((it) => {
        const key = keyOf(it);
        const isBusy = busy === key;
        if (it.kind === 'tests') {
          return (
            <div key={key} className="flex flex-col gap-2.5 rounded-xl border border-[#f3d9a4] bg-[#fffaf0] p-3.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-bold">{it.title}</span>
                <span className="text-[13px] text-[#3f3f46]">{it.detail}</span>
              </div>
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  run(
                    key,
                    () => setTestFlag(it.orderIds, true),
                    `${it.orderIds.length} order${it.orderIds.length === 1 ? '' : 's'} marked as test`,
                    () => setTestFlag(it.orderIds, false)
                  )
                }
                className={`${btn} border border-[#d4a24c] bg-white`}
              >
                Mark all {it.orderIds.length} as test
              </button>
            </div>
          );
        }
        return (
          <div key={key} className="flex flex-col gap-3 rounded-xl border border-[#f5c2c7] bg-[#fff5f5] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] font-bold">{it.title}</span>
                <span className="text-[13px] text-[#3f3f46]">{it.detail}</span>
              </div>
              <Link href={it.href} className="whitespace-nowrap text-[13px] font-semibold text-[#3f3f46] underline">
                Open
              </Link>
            </div>
            {it.kind === 'pending' ? (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={isBusy} onClick={() => orderAction(it, 'confirmed', 'confirmed')} className={`${btn} bg-[#71717a] text-white`}>
                  Confirm
                </button>
                <button type="button" disabled={isBusy} onClick={() => setConfirm(it)} className={`${btn} border border-[#f5c2c7] bg-white text-[#be123c]`}>
                  Decline
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button type="button" disabled={isBusy} onClick={() => orderAction(it, 'out_for_delivery', 'sent out')} className={`${btn} bg-[#4f7a52] text-white`}>
                  Send out
                </button>
                <button type="button" disabled={isBusy} onClick={() => orderAction(it, 'completed', 'completed & paid')} className={`${btn} bg-[#2a4a2d] text-white`}>
                  Complete
                </button>
                <button type="button" disabled={isBusy} onClick={() => setConfirm(it)} className={`${btn} border border-[#f5c2c7] bg-white text-[#be123c]`}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}

      {toast && (
        <div role="status" className="fixed inset-x-4 bottom-6 z-40 mx-auto flex max-w-3xl md:left-[17rem] items-center justify-between gap-2 rounded-xl bg-[#18181b] py-2 pl-4 pr-2 text-sm text-white">
          <span>{toast.text}</span>
          <button type="button" onClick={undo} className="h-11 px-3.5 font-semibold text-[#a7d1a8]">
            Undo
          </button>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:left-64" onClick={() => setConfirm(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Cancel ${displayOrderNumber(confirm.orderNumber)}`}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-t-[18px] bg-white px-4 pb-6 pt-5"
          >
            <h2 className="m-0 text-lg font-bold">Cancel {displayOrderNumber(confirm.orderNumber)}?</h2>
            <p className="m-0 text-sm text-[#3f3f46]">It will be marked Cancelled. You can undo for 5 seconds.</p>
            <button
              type="button"
              onClick={() => {
                const it = confirm;
                setConfirm(null);
                orderAction(it, 'cancelled', it.kind === 'pending' ? 'declined' : 'cancelled');
              }}
              className="h-12 rounded-[10px] bg-[#be123c] text-[15px] font-semibold text-white"
            >
              {confirm.kind === 'pending' ? 'Decline order' : 'Cancel order'}
            </button>
            <button type="button" onClick={() => setConfirm(null)} className="h-11 text-[15px] font-semibold text-[#3f3f46]">
              Keep it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
