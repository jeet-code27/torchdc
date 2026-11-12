"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FaqListEditor, type FaqRow } from "@/components/admin/faq-list-editor";

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 disabled:opacity-60";
const labelCls = "block text-xs font-semibold text-foreground mb-1.5";
const codeCls = `${inputCls} font-mono text-xs leading-relaxed resize-y`;

type PageInfo = { key: string; label: string; path: string; kind: "home" | "static" | "area" };
type Copy = { body: string; chips: string[]; faq: FaqRow[] };

function HtmlHelp() {
  return (
    <p className="text-[11px] text-muted-foreground mt-1">
      HTML, as on the client site. Keep the tags and class names; change the words. Links: {'<a href="/faq">FAQ</a>'}. Questions in{" "}
      {"<details><summary>…</summary><p>…</p></details>"} are added to the page&apos;s FAQ schema automatically.
    </p>
  );
}

/** Edit the text of a built-in page (homepage, About, FAQ, Terms, Privacy, neighborhood pages) */
export function BuiltInPageEditor({ pageKey, canEdit, onBack }: { pageKey: string; canEdit: boolean; onBack: () => void }) {
  const [info, setInfo] = React.useState<PageInfo | null>(null);
  const [builtIn, setBuiltIn] = React.useState<Copy | null>(null);
  const [draft, setDraft] = React.useState<Copy | null>(null);
  const [edited, setEdited] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/pages?key=${encodeURIComponent(pageKey)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const b: Copy = data.builtIn;
      const s = data.saved as Copy | null;
      setInfo(data.page);
      setBuiltIn(b);
      setEdited(Boolean(s && (s.body?.trim() || s.chips?.length || s.faq?.length)));
      setDraft({
        body: s?.body?.trim() ? s.body : b.body,
        chips: s?.chips?.length ? s.chips : b.chips,
        faq: s?.faq?.length ? s.faq : b.faq,
      });
    } catch (err) {
      toast.error((err as Error).message || "Couldn't load the page");
    }
  }, [pageKey]);

  React.useEffect(() => {
    load();
  }, [load]);

  const save = async (copy: Copy, okText: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: pageKey, ...copy }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      toast.success(okText);
      await load();
    } catch (err) {
      toast.error((err as Error).message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!info || !draft || !builtIn) return <p className="py-12 text-center text-sm text-muted-foreground">Loading page…</p>;
  const isHome = info.kind === "home";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onBack} className="text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" /> All pages
          </Button>
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              {info.label}
              {edited && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5A805B]/10 text-[#5A805B] font-semibold">Edited</span>}
            </h2>
            <a
              href={info.path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground"
            >
              {info.path} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {edited && (
              <Button type="button" variant="outline" size="sm" className="text-xs" disabled={saving} onClick={() => setConfirmReset(true)}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Back to client&apos;s text
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={() => save(draft, `${info.label} saved`)}
              className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs"
            >
              <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        The search title, description, H1 and canonical are set on Admin › SEO. {isHome ? "The H1 sits above the intro." : "The H1 set there replaces the first heading in the text below."}
      </p>

      <section className="p-4 rounded-xl border border-border bg-card space-y-2">
        <label className={labelCls}>{isHome ? "Intro under the banner" : "Page text"}</label>
        <textarea
          rows={isHome ? 6 : 28}
          className={codeCls}
          disabled={!canEdit}
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
        />
        <HtmlHelp />
      </section>

      {isHome && (
        <>
          <section className="p-4 rounded-xl border border-border bg-card space-y-2">
            <label className={labelCls}>Fact chips (one per line)</label>
            <textarea
              rows={6}
              className={inputCls}
              disabled={!canEdit}
              value={draft.chips.join("\n")}
              onChange={(e) => setDraft({ ...draft, chips: e.target.value.split("\n") })}
            />
          </section>
          <section className="p-4 rounded-xl border border-border bg-card space-y-3">
            <label className={labelCls}>Homepage FAQ (also the homepage&apos;s FAQ schema)</label>
            <FaqListEditor items={draft.faq} onChange={(faq) => setDraft({ ...draft, faq })} disabled={!canEdit} />
          </section>
        </>
      )}

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Go back to the client's text?"
        description={`${info.label} will show the text from the client's site again. Your edits on this page are removed.`}
        confirmText="Use client's text"
        isLoading={saving}
        onConfirm={async () => {
          await save({ body: "", chips: [], faq: [] }, `${info.label}: back to the client's text`);
          setConfirmReset(false);
        }}
      />
    </div>
  );
}

type Custom = {
  key?: string;
  slug: string;
  name: string;
  state: string;
  title: string;
  description: string;
  body: string;
  isPublished: boolean;
};
type Template = { key: string; name: string; state: string };

const STATE_SUFFIX: Record<string, string> = { DC: "dc", MD: "md", VA: "va" };

/** Create or edit a new neighborhood page */
export function CustomPageEditor({
  pageKey,
  templates,
  canEdit,
  onBack,
  onSaved,
}: {
  pageKey: string | null;
  templates: Template[];
  canEdit: boolean;
  onBack: () => void;
  onSaved: (key: string) => void;
}) {
  const isNew = !pageKey;
  const [form, setForm] = React.useState<Custom>({ slug: "", name: "", state: "DC", title: "", description: "", body: "", isPublished: false });
  const [loaded, setLoaded] = React.useState(isNew);
  const [slugTouched, setSlugTouched] = React.useState(!isNew);
  const [template, setTemplate] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    if (!pageKey) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/pages?key=${encodeURIComponent(pageKey)}`);
        const data = await res.json();
        if (!data.success || !data.custom) throw new Error(data.error || "Page not found");
        setForm(data.custom);
        setLoaded(true);
      } catch (err) {
        toast.error((err as Error).message || "Couldn't load the page");
      }
    })();
  }, [pageKey]);

  const set = (patch: Partial<Custom>) =>
    setForm((cur) => {
      const next = { ...cur, ...patch };
      // Suggested URL: cannabis-delivery-in-<name>-<state>, like the client's pages
      if (!slugTouched && (patch.name !== undefined || patch.state !== undefined)) {
        const base = next.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        next.slug = base ? `cannabis-delivery-in-${base}-${STATE_SUFFIX[next.state] || "dc"}` : "";
      }
      return next;
    });

  // Start from an existing neighborhood page: its text with the neighborhood name swapped
  const applyTemplate = async (key: string) => {
    setTemplate(key);
    if (!key) return;
    const t = templates.find((x) => x.key === key);
    try {
      const res = await fetch(`/api/admin/pages?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      let html: string = data.builtIn.body;
      if (t && form.name.trim()) html = html.split(t.name).join(form.name.trim());
      setForm((cur) => ({ ...cur, body: html }));
      toast.success(
        form.name.trim()
          ? `Copied the ${t?.name} page with "${t?.name}" changed to "${form.name.trim()}". Now rewrite the details.`
          : `Copied the ${t?.name} page. Type the neighborhood name first to swap it in automatically.`
      );
    } catch {
      toast.error("Couldn't copy that page");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? form : { ...form, key: pageKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      toast.success(isNew ? "Page created" : "Page saved");
      setForm(data.custom);
      onSaved(data.custom.key);
    } catch (err) {
      toast.error((err as Error).message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages?key=${encodeURIComponent(pageKey || "")}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      toast.success("Page deleted");
      onBack();
    } catch (err) {
      toast.error((err as Error).message || "Delete failed");
    } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  if (!loaded) return <p className="py-12 text-center text-sm text-muted-foreground">Loading page…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onBack} className="text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" /> All pages
          </Button>
          <h2 className="text-base font-bold text-foreground">{isNew ? "New neighborhood page" : form.name || "Neighborhood page"}</h2>
          {!isNew && form.isPublished && (
            <a
              href={`/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground"
            >
              /{form.slug} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {!isNew && (
              <Button type="button" variant="outline" size="sm" className="text-xs hover:text-rose-600" disabled={saving} onClick={() => setConfirmDelete(true)}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            )}
            <Button type="button" size="sm" disabled={saving} onClick={save} className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs">
              <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : isNew ? "Create page" : "Save"}
            </Button>
          </div>
        )}
      </div>

      <section className="p-4 rounded-xl border border-border bg-card grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Neighborhood name</label>
          <input className={inputCls} disabled={!canEdit} placeholder="Wheaton" value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>State (which list it joins)</label>
          <select className={inputCls} disabled={!canEdit} value={form.state} onChange={(e) => set({ state: e.target.value })}>
            <option value="DC">Washington, DC</option>
            <option value="MD">Maryland</option>
            <option value="VA">Virginia</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>URL</label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground font-mono">torchdc.co/</span>
            <input
              className={`${inputCls} font-mono text-xs`}
              disabled={!canEdit}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: e.target.value.toLowerCase() });
              }}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>
            Search title <span className="font-normal text-muted-foreground">({form.title.length}/60)</span>
          </label>
          <input
            className={inputCls}
            disabled={!canEdit}
            placeholder={form.name ? `Cannabis Delivery in ${form.name} | Torch` : ""}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>
            Search description <span className="font-normal text-muted-foreground">({form.description.length}/160)</span>
          </label>
          <textarea rows={2} className={inputCls} disabled={!canEdit} value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </div>
        <label className="md:col-span-2 flex items-start gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 mt-0.5 accent-[#5A805B]"
            disabled={!canEdit}
            checked={form.isPublished}
            onChange={(e) => set({ isPublished: e.target.checked })}
          />
          <span>
            Live on the website
            <span className="block text-[11px] text-muted-foreground">
              Shows the page, adds it to the sitemap and to the footer, menu and homepage neighborhood lists. Off: nobody can open it.
            </span>
          </span>
        </label>
      </section>

      <section className="p-4 rounded-xl border border-border bg-card space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className={labelCls}>Page text</label>
          {canEdit && (
            <select className={`${inputCls} max-w-xs text-xs`} value={template} onChange={(e) => applyTemplate(e.target.value)}>
              <option value="">Start from an existing page…</option>
              {["DC", "MD", "VA"].map((st) => (
                <optgroup key={st} label={st}>
                  {templates
                    .filter((t) => t.state === st)
                    .map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          )}
        </div>
        <textarea rows={28} className={codeCls} disabled={!canEdit} value={form.body} onChange={(e) => set({ body: e.target.value })} />
        <HtmlHelp />
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this page?"
        description={`/${form.slug} stops working and leaves the sitemap and neighborhood lists. This can't be undone. Consider a 301 redirect on Admin › SEO.`}
        confirmText="Delete page"
        variant="destructive"
        isLoading={saving}
        onConfirm={remove}
      />
    </div>
  );
}
