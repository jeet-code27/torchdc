'use client';

import { useState } from 'react';
import type { AdminOrder, OrderStatus } from './types';
import { ACCENT, STATUS, TIMELINE, buildCopyText, copyToClipboard, timelineIndex } from './status';

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[status].badge}`}>
      {STATUS[status].label}
    </span>
  );
}

export function NewTag() {
  return <span className="rounded-md bg-[#27272a] px-[7px] py-[3px] text-[11px] font-bold tracking-wider text-white">NEW</span>;
}

/** Placed → Confirmed → Out → Delivered. `times` optionally labels each step. */
export function Timeline({ status, times, large }: { status: OrderStatus; times?: Partial<Record<OrderStatus, string>>; large?: boolean }) {
  const idx = timelineIndex(status);
  const dot = large ? 14 : 12;
  return (
    <ol aria-label="Fulfillment timeline" className="grid grid-cols-4">
      {TIMELINE.map((step, k) => {
        const done = idx >= 0 && k <= idx;
        const current = k === idx && status !== 'completed';
        const lineL = k === 0 ? 'transparent' : k <= idx ? ACCENT : '#e4e4e7';
        const lineR = k === TIMELINE.length - 1 ? 'transparent' : k < idx ? ACCENT : '#e4e4e7';
        return (
          <li key={step.status} className="flex flex-col items-center gap-1.5">
            <div className="flex h-4 w-full items-center">
              <div className="h-0.5 flex-1" style={{ background: lineL }} />
              <div
                className="shrink-0 rounded-full"
                style={
                  current
                    ? { width: dot + 2, height: dot + 2, background: '#fff', border: `4px solid ${ACCENT}` }
                    : done
                      ? { width: dot, height: dot, background: ACCENT }
                      : { width: dot, height: dot, background: '#fff', border: '2px solid #d4d4d8' }
                }
              />
              <div className="h-0.5 flex-1" style={{ background: lineR }} />
            </div>
            <span
              className={`text-center leading-tight ${large ? 'text-xs' : 'text-[11px]'} ${
                current ? 'font-bold text-[#0a0a0a]' : done ? 'font-medium text-[#3f3f46]' : 'text-[#71717a]'
              }`}
            >
              {step.label}
              {times?.[step.status] ? (
                <>
                  <br />
                  {times[step.status]}
                </>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function NoteBox({ text, large }: { text: string; large?: boolean }) {
  return (
    <div className={`flex items-start gap-2 rounded-[10px] border border-[#f3d9a4] bg-[#fff8e6] ${large ? 'p-3.5' : 'px-2.5 py-2'}`}>
      <ChatIcon className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-1">
        {large && <span className="text-xs font-bold tracking-wide text-[#9a3f06]">CUSTOMER NOTE</span>}
        <span className={large ? 'text-base leading-snug' : 'text-[13px] leading-snug text-[#3f3f46]'}>{text}</span>
      </div>
    </div>
  );
}

/** Icon-only (cards) or full-width (details) copy button with a "Copied" state. */
export function CopyOrderButton({ order, full }: { order: AdminOrder; full?: boolean }) {
  const [copied, setCopied] = useState(false);
  const text = buildCopyText(order);
  const onCopy = async () => {
    const ok = await copyToClipboard(text);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), full ? 4000 : 2500);
  };

  if (!full) {
    return (
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy name, phone, address and items for ${order.orderNumber}`}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border ${
          copied ? 'border-[#86efac] bg-[#dcfce7] text-[#166534]' : 'border-[#e4e4e7] bg-white text-[#0a0a0a]'
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onCopy}
        className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-[15px] font-semibold ${
          copied ? 'border-[#86efac] bg-[#dcfce7] text-[#166534]' : 'border-[#0a0a0a] bg-[#0a0a0a] text-white'
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? 'Copied to clipboard' : 'Copy order info'}
      </button>
      {copied && (
        <pre className="m-0 whitespace-pre-wrap rounded-[10px] border border-dashed border-[#a1a1aa] bg-white px-3 py-2.5 font-sans text-[13px] leading-relaxed text-[#3f3f46]">
          {text}
        </pre>
      )}
    </div>
  );
}

/* Icons (inline stroke SVG) */
type IconProps = { className?: string; size?: number };
const svg = (size = 18) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const CopyIcon = ({ className, size }: IconProps) => (
  <svg {...svg(size)} className={className}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
export const CheckIcon = ({ className, size }: IconProps) => (
  <svg {...svg(size)} strokeWidth={2.6} className={className}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);
export const ArrowIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...svg(size)} strokeWidth={2.2} className={className}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);
export const ClockIcon = ({ className, size = 15 }: IconProps) => (
  <svg {...svg(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const TruckIcon = ({ className, size = 15 }: IconProps) => (
  <svg {...svg(size)} className={className}>
    <rect x="1" y="6" width="14" height="10" rx="1" />
    <path d="M15 9h4l3 3v4h-7" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);
export const ChatIcon = ({ className, size = 15 }: IconProps) => (
  <svg {...svg(size)} stroke="#9a3f06" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
export const PhoneIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...svg(size)} className={className}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
export const NavIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...svg(size)} className={className}>
    <path d="M3 11l19-9-9 19-2-8-8-2z" />
  </svg>
);
export const SearchIcon = ({ className, size = 16 }: IconProps) => (
  <svg {...svg(size)} stroke="#71717a" className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
export const BackIcon = ({ className, size = 22 }: IconProps) => (
  <svg {...svg(size)} className={className}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
