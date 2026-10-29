"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { ExternalLink, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageEntry = { key: string; path: string; label: string; group: string; title: string; description: string };
type Override = { title?: string; description?: string; noindex?: boolean };
type Settings = { googleVerification: string; bingVerification: string; defaultShareImage: string; pages: Record<string, Override> };

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 disabled:opacity-60";

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={`text-[11px] ${value.length > max ? "text-rose-600 font-semibold" : "text-muted-foreground"}`}>
      {value.length}/{max}
    </span>
  );
}

/** What each page shows right now: the text saved here, otherwise its built-in text. */
function effectiveDrafts(list: PageEntry[], saved: Record<string, Override>): Record<string, Override> {
  return Object.fromEntries(
    list.map((p) => {
      const s = saved[p.key] || {};
      return [p.key, { title: s.title || p.title, description: s.description || p.description, noindex: Boolean(s.noindex) }];
    })
  );
}

/** Admin › SEO › Search settings: verification codes, share image and per-page titles (all used by the live site). */
export function SeoSettingsPanel({ canEdit }: { canEdit: boolean }) {
  const [pages, setPages] = React.useState<PageEntry[]>([]);
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [global, setGlobal] = React.useState({ bingVerification: "", defaultShareImage: "" });
  const [drafts, setDrafts] = React.useState<Record<string, Override>>({});
  const [savingKey, setSavingKey] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/seo/settings");
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setPages(data.pageList);
        setSettings(data.settings);
        setGlobal({ bingVerification: data.settings.bingVerification, defaultShareImage: data.settings.defaultShareImage });
        setDrafts(effectiveDrafts(data.pageList, data.settings.pages || {}));
      } catch {
        toast.error("Couldn't load search settings");
      }
    })();
  }, []);

  const save = async (key: string, body: Record<string, unknown>, okText: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/seo/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      setSettings(data.settings);
      setDrafts(effectiveDrafts(pages, data.settings.pages || {}));
      setGlobal({ bingVerification: data.settings.bingVerification, defaultShareImage: data.settings.defaultShareImage });
      toast.success(okText);
    } catch (err) {
      toast.error((err as Error).message || "Save failed");
    } finally {
      setSavingKey(null);
    }
  };

  if (!settings) return <p className="py-12 text-center text-sm text-muted-foreground">Loading search settings…</p>;

  const q = filter.trim().toLowerCase();
  const shown = pages.filter((p) => !q || p.label.toLowerCase().includes(q) || p.path.includes(q));
  const groups = Array.from(new Set(shown.map((p) => p.group)));

  return (
    <div className="space-y-8">
      {/* Verification + share image */}
      <section className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Search engines &amp; sharing</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Google Search Console is already verified (verification file on the site), so nothing is needed for Google here.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-foreground">Bing Webmaster code (msvalidate.01)</span>
            <input
              className={`${inputCls} font-mono text-xs`}
              disabled={!canEdit}
              placeholder='<meta name="msvalidate.01" content="…" />'
              value={global.bingVerification}
              onChange={(e) => setGlobal({ ...global, bingVerification: e.target.value })}
            />
          </label>
          <label className="space-y-1.5 block md:col-span-2">
            <span className="text-xs font-semibold text-foreground">Share image (link previews on WhatsApp, iMessage, Facebook)</span>
            <input
              className={inputCls}
              disabled={!canEdit}
              placeholder="Default: /assets/img/og.jpg (1200 × 630)"
              value={global.defaultShareImage}
              onChange={(e) => setGlobal({ ...global, defaultShareImage: e.target.value })}
            />
          </label>
        </div>
        {canEdit && (
          <Button
            type="button"
            disabled={savingKey === "__global"}
            onClick={() => save("__global", global, "Search engine settings saved")}
            className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs font-medium flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {savingKey === "__global" ? "Saving..." : "Save"}
          </Button>
        )}
        <p className="text-[11px] text-muted-foreground">
          XML sitemap:{" "}
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="underline">
            /sitemap.xml
          </a>{" "}
          · robots.txt:{" "}
          <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="underline">
            /robots.txt
          </a>
        </p>
      </section>

      {/* Per-page titles */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Page titles &amp; descriptions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Each field shows the title and description the page uses right now. Edit and save to change them. Products and
              categories are edited on their own pages, and blog posts in the blog editor.
            </p>
          </div>
          <input
            className={`${inputCls} max-w-xs`}
            placeholder="Find a page…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {groups.map((group) => (
          <div key={group} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">{group}</h4>
            {shown
              .filter((p) => p.group === group)
              .map((p) => {
                const d = drafts[p.key] || {};
                const saved = settings.pages[p.key] || {};
                const liveTitle = saved.title || p.title;
                const liveDesc = saved.description || p.description;
                const dirty =
                  (d.title ?? "") !== liveTitle || (d.description ?? "") !== liveDesc || Boolean(d.noindex) !== Boolean(saved.noindex);
                // Text equal to the built-in text is saved as "nothing set", so the page keeps the built-in version
                const payload = {
                  title: (d.title || "").trim() === p.title ? "" : (d.title || "").trim(),
                  description: (d.description || "").trim() === p.description ? "" : (d.description || "").trim(),
                  noindex: Boolean(d.noindex),
                };
                const custom = Boolean(saved.title || saved.description || saved.noindex);
                const set = (patch: Override) => setDrafts((cur) => ({ ...cur, [p.key]: { ...cur[p.key], ...patch } }));
                const title = d.title || "";
                const desc = d.description || "";
                return (
                  <div key={p.key} className="p-4 rounded-xl border border-border bg-card space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{p.label}</span>
                        <a
                          href={p.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground"
                        >
                          {p.path} <ExternalLink className="w-3 h-3" />
                        </a>
                        {custom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5A805B]/10 text-[#5A805B] font-semibold">Custom</span>
                        )}
                        {saved.noindex && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 font-semibold">Hidden from Google</span>
                        )}
                      </div>
                    </div>
                    <label className="block space-y-1">
                      <span className="flex justify-between text-xs font-semibold text-foreground">
                        Title <Counter value={title} max={60} />
                      </span>
                      <input className={inputCls} disabled={!canEdit} placeholder={p.title} value={title} onChange={(e) => set({ title: e.target.value })} />
                    </label>
                    <label className="block space-y-1">
                      <span className="flex justify-between text-xs font-semibold text-foreground">
                        Description <Counter value={desc} max={160} />
                      </span>
                      <textarea
                        rows={2}
                        className={inputCls}
                        disabled={!canEdit}
                        placeholder={p.description}
                        value={desc}
                        onChange={(e) => set({ description: e.target.value })}
                      />
                    </label>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#5A805B]"
                          disabled={!canEdit}
                          checked={Boolean(d.noindex)}
                          onChange={(e) => set({ noindex: e.target.checked })}
                        />
                        Hide this page from Google (noindex, left out of the sitemap)
                      </label>
                      {canEdit && (
                        <div className="flex gap-2">
                          {custom && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              disabled={savingKey === p.key}
                              onClick={() =>
                                save(p.key, { pages: { [p.key]: { title: "", description: "", noindex: false } } }, `${p.label}: back to built-in text`)
                              }
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            disabled={!dirty || savingKey === p.key}
                            onClick={() => {
                              if (!payload.title && !(d.title || "").trim()) return toast.error("Title can't be empty");
                              if (!payload.description && !(d.description || "").trim()) return toast.error("Description can't be empty");
                              save(p.key, { pages: { [p.key]: payload } }, `${p.label} saved`);
                            }}
                            className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs"
                          >
                            {savingKey === p.key ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </section>
    </div>
  );
}
