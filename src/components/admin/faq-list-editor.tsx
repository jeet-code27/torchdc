"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export type FaqRow = { q: string; a: string };

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 disabled:opacity-60";

/** Questions and answers, edited as a list (answers may contain links: <a href="/faq">FAQ</a>) */
export function FaqListEditor({
  items,
  onChange,
  disabled,
}: {
  items: FaqRow[];
  onChange: (items: FaqRow[]) => void;
  disabled?: boolean;
}) {
  const update = (i: number, patch: Partial<FaqRow>) => onChange(items.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={i} className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground w-6 shrink-0">Q{i + 1}</span>
            <input
              className={inputCls}
              disabled={disabled}
              placeholder="Question"
              value={f.q}
              onChange={(e) => update(i, { q: e.target.value })}
            />
            <div className="flex shrink-0">
              <button
                type="button"
                disabled={disabled || i === 0}
                onClick={() => move(i, -1)}
                aria-label={`Move question ${i + 1} up`}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={disabled || i === items.length - 1}
                onClick={() => move(i, 1)}
                aria-label={`Move question ${i + 1} down`}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                aria-label={`Delete question ${i + 1}`}
                className="p-1.5 rounded text-muted-foreground hover:text-rose-600 disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            rows={2}
            className={`${inputCls} ml-8 w-[calc(100%-2rem)]`}
            disabled={disabled}
            placeholder="Answer (links allowed)"
            value={f.a}
            onChange={(e) => update(i, { a: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange([...items, { q: "", a: "" }])}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A805B] hover:underline disabled:opacity-50"
      >
        <Plus className="w-3.5 h-3.5" /> Add question
      </button>
    </div>
  );
}
