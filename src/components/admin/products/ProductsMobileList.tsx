'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type AdminProductRow = {
  _id: string;
  name: string;
  category: string; // primary category name, e.g. "Flower"
  priceLabel: string; // "$60" or "4 sizes"
  inStock: boolean;
  isBestSeller?: boolean;
  imageUrl?: string;
};

export type ProductsMobileListProps = {
  products: AdminProductRow[];
  /** Categories shown as filter chips, in order. */
  categories: string[];
  setInStock: (productId: string, inStock: boolean) => Promise<void>;
  editHref?: (id: string) => string;
  addHref?: string;
};

const OUT = '__out__';

export default function ProductsMobileList({
  products,
  categories,
  setInStock,
  editHref = (id) => `/admin/products/${id}`,
  addHref = '/admin/products/new',
}: ProductsMobileListProps) {
  const [stock, setStock] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => products.map((p) => ({ ...p, inStock: stock[p._id] ?? p.inStock })), [products, stock]);
  const outCount = rows.filter((p) => !p.inStock).length;

  const visible = rows.filter((p) => {
    if (filter === OUT && p.inStock) return false;
    if (filter !== 'All' && filter !== OUT && p.category !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q);
  });

  async function toggle(p: AdminProductRow & { inStock: boolean }) {
    const next = !p.inStock;
    setStock((s) => ({ ...s, [p._id]: next }));
    setError(null);
    try {
      await setInStock(p._id, next);
    } catch {
      setStock((s) => ({ ...s, [p._id]: !next }));
      setError(`Couldn't update ${p.name}. Try again.`);
    }
  }

  const chips = ['All', ...categories, OUT];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col pb-6 font-[Jost,system-ui,sans-serif] text-[#0a0a0a]">
      <div className="flex items-center justify-between px-4 pt-5">
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 text-[26px] font-bold">Products</h1>
          <span className="text-sm text-[#52525b]">
            {rows.length} total · {outCount ? `${outCount} out of stock` : 'all in stock'}
          </span>
        </div>
        <Link href={addHref} className="flex h-11 items-center gap-1.5 rounded-[10px] bg-[#4c6e4d] px-4 text-sm font-semibold text-white">
          + Add
        </Link>
      </div>

      <div className="px-4 pt-4">
        <label className="flex h-11 items-center gap-2 rounded-[10px] border border-[#e4e4e7] px-3">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-full border-0 bg-transparent text-[15px] outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pt-3">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
            className={`h-9 rounded-full px-3.5 text-[13px] font-semibold ${filter === c ? 'border border-[#0a0a0a] bg-[#0a0a0a] text-white' : 'border border-[#d4d4d8] bg-white'}`}
          >
            {c === OUT ? `Out of stock (${outCount})` : c}
          </button>
        ))}
      </div>

      {error && <p className="mx-4 mt-3 rounded-lg bg-[#fff1f2] px-3 py-2 text-sm text-[#be123c]">{error}</p>}

      <ul className="m-0 flex list-none flex-col px-4 pt-2">
        {visible.length === 0 && <li className="py-10 text-center text-sm text-[#52525b]">No products match.</li>}
        {visible.map((p) => (
          <li key={p._id} className="flex items-center gap-3 border-b border-[#f0f0f2] py-3">
            <div className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#f4f4f5] ${p.inStock ? '' : 'opacity-45'}`}>
              {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <Link href={editHref(p._id)} className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-semibold leading-tight">{p.name}</span>
              <span className="text-[13px] text-[#52525b]">
                {p.category} · {p.priceLabel}
                {p.isBestSeller ? ' · Best seller' : ''}
              </span>
              <span className={`text-xs font-semibold ${p.inStock ? 'text-[#1f6b33]' : 'text-[#be123c]'}`}>
                {p.inStock ? 'In stock' : 'Out of stock · hidden from menu'}
              </span>
            </Link>
            <button
              type="button"
              role="switch"
              aria-checked={p.inStock}
              aria-label={`${p.inStock ? 'Mark out of stock' : 'Mark in stock'}: ${p.name}`}
              onClick={() => toggle(p)}
              className={`flex h-8 w-[52px] shrink-0 rounded-full p-[3px] ${p.inStock ? 'justify-end bg-[#4c6e4d]' : 'justify-start bg-[#d4d4d8]'}`}
            >
              <span className="h-[26px] w-[26px] rounded-full bg-white shadow" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
