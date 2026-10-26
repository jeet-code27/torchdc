"use client";

import * as React from "react";

/**
 * Delivery address box with Google suggestions (client site addressBox(), Oct 24).
 * Picking a suggestion looks up the exact place and its delivery fee on the server (/api/place).
 * Typing after a pick clears it, so the customer has to pick again. Without a Google key on the
 * server (acOff) it is a plain text box.
 */

export type Zone = "DC" | "MD" | "VA";
export type PickedPlace = {
  id: string;
  address: string;
  state: string;
  quote: { fee: number | null; band: "dc" | "inside" | "near" | "outer" | "far" | "other" } | null;
};
type Suggestion = { id: string; main: string; sub: string };

const PIN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A805B" strokeWidth="2" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

interface CheckoutAddressProps {
  value: string;
  onValueChange: (v: string) => void;
  place: PickedPlace | null;
  onPlace: (p: PickedPlace | null) => void;
  acOff: boolean;
  onAcOff: () => void;
  session: string;
  onNewSession: () => void;
}

export function CheckoutAddress({
  value,
  onValueChange,
  place,
  onPlace,
  acOff,
  onAcOff,
  session,
  onNewSession,
}: CheckoutAddressProps) {
  const [items, setItems] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQ = React.useRef("");

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const search = async (q: string) => {
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(q)}&s=${session}`);
      const d = await res.json();
      if (d.disabled || !res.ok) {
        onAcOff();
        close();
        return;
      }
      if (q !== lastQ.current) return;
      setItems(d.suggestions || []);
      setActive(-1);
      setOpen((d.suggestions || []).length > 0);
    } catch {
      onAcOff();
      close();
    }
  };

  const pick = async (it: Suggestion) => {
    close();
    onValueChange(it.main + (it.sub ? `, ${it.sub}` : ""));
    try {
      const res = await fetch(`/api/place?id=${encodeURIComponent(it.id)}&s=${session}`);
      const p = await res.json();
      onNewSession();
      if (!res.ok || !p || !p.quote) throw new Error("no quote");
      onValueChange(p.address);
      onPlace({ id: it.id, address: p.address, state: p.state, quote: p.quote });
    } catch {
      onPlace(null);
      onAcOff();
    }
  };

  const onInput = (v: string) => {
    onValueChange(v);
    if (place) onPlace(null);
    const q = v.trim();
    lastQ.current = q;
    if (timer.current) clearTimeout(timer.current);
    if (acOff || q.length < 3) {
      setItems([]);
      close();
      return;
    }
    timer.current = setTimeout(() => search(q), 220);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + items.length) % items.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      close();
    }
  };

  return (
    <div className="acwrap">
      <input
        id="c-addr"
        name="address"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="c-addr-list"
        aria-activedescendant={open && active >= 0 ? `c-addr-o${active}` : undefined}
        placeholder={acOff ? "Street address" : "Start typing your street address"}
        value={value}
        onChange={(e) => onInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(close, 150)}
      />
      <div className="ac" id="c-addr-list" role="listbox" hidden={!open} onMouseDown={(e) => e.preventDefault()}>
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            role="option"
            id={`c-addr-o${i}`}
            aria-selected={i === active}
            className={i === active ? "is-on" : undefined}
            onClick={() => pick(it)}
          >
            {PIN}
            <span>
              {it.main}
              <small>{it.sub}</small>
            </span>
          </button>
        ))}
        <div className="ac__by">powered by Google</div>
      </div>
    </div>
  );
}
