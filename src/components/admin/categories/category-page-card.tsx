"use client";

import * as React from "react";
import { ExternalLink, FileText } from "lucide-react";
import { FaqListEditor } from "@/components/admin/faq-list-editor";
import { defaultCategoryCopy, type CategoryCopy } from "@/lib/category-content";

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30";
const labelCls = "block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5";

/** What to save: fields equal to the built-in copy are saved empty, so the page keeps following it */
export function categoryCopyPayload(slug: string, copy: CategoryCopy) {
  const d = defaultCategoryCopy(slug);
  const same = (a: string, b: string) => a.trim() === b.trim();
  const faq = copy.faq.map((f) => ({ q: f.q.trim(), a: f.a.trim() })).filter((f) => f.q && f.a);
  const faqSame = faq.length === d.faq.length && faq.every((f, i) => same(f.q, d.faq[i].q) && same(f.a, d.faq[i].a));
  return {
    label: same(copy.label, d.label) ? "" : copy.label.trim(),
    h1: same(copy.h1, d.h1) ? "" : copy.h1.trim(),
    intro: same(copy.intro, d.intro) ? "" : copy.intro.trim(),
    faqTitle: same(copy.faqTitle, d.faqTitle) ? "" : copy.faqTitle.trim(),
    faq: faqSame ? [] : faq,
  };
}

/** Admin › Categories: the copy shown on the category's page (label, H1, intro, FAQ) */
export function CategoryPageCard({
  slug,
  value,
  onChange,
}: {
  slug: string;
  value: CategoryCopy;
  onChange: (v: CategoryCopy) => void;
}) {
  const path = slug === "flowers" ? "/flowers" : `/product-category/${slug}`;
  const set = (patch: Partial<CategoryCopy>) => onChange({ ...value, ...patch });

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Category page text</h2>
        </div>
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground"
        >
          {path} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Shown on the website. The fields start with what the page shows now; clear a field to go back to the built-in text.
        {slug === "flowers" && " The H1 set on Admin › SEO for the Flower page wins over the one here."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Small label</label>
          <input className={inputCls} value={value.label} onChange={(e) => set({ label: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>H1 (page heading)</label>
          <input className={inputCls} value={value.h1} onChange={(e) => set({ h1: e.target.value })} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Intro text</label>
        <textarea rows={4} className={`${inputCls} resize-y`} value={value.intro} onChange={(e) => set({ intro: e.target.value })} />
        <p className="text-[11px] text-muted-foreground mt-1">
          Links allowed, for example: {'<a href="/product-category/cartridges">THC carts</a>'}
        </p>
      </div>

      <div className="space-y-2">
        <label className={labelCls}>FAQ heading</label>
        <input className={inputCls} value={value.faqTitle} onChange={(e) => set({ faqTitle: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className={labelCls}>FAQ (also added to the page&apos;s FAQ schema)</label>
        <FaqListEditor items={value.faq} onChange={(faq) => set({ faq })} />
      </div>
    </div>
  );
}
