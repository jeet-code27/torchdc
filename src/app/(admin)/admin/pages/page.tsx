"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Edit, ExternalLink, Plus } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import { BuiltInPageEditor, CustomPageEditor } from "@/components/admin/pages/page-editor";

type PageRow = { key: string; label: string; group: string; path: string; edited: boolean; updatedAt: string | null };
type CustomRow = { key: string; slug: string; name: string; state: string; isPublished: boolean; updatedAt: string };
type Template = { key: string; name: string; state: string };

type View = { mode: "list" } | { mode: "builtin"; key: string } | { mode: "custom"; key: string | null };

const STATE_LABEL: Record<string, string> = { DC: "Washington, DC", MD: "Maryland", VA: "Virginia" };

/** Admin › Pages: text of the homepage, About, FAQ, Terms, Privacy and neighborhood pages; new neighborhood pages */
export default function PagesAdminPage() {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("seo.manage");
  const [view, setView] = React.useState<View>({ mode: "list" });
  const [pages, setPages] = React.useState<PageRow[]>([]);
  const [custom, setCustom] = React.useState<CustomRow[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPages(data.pages);
      setCustom(data.custom);
      setTemplates(data.templates);
    } catch {
      toast.error("Couldn't load pages");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const back = () => {
    setView({ mode: "list" });
    load();
  };

  const q = filter.trim().toLowerCase();
  const shown = pages.filter((p) => !q || p.label.toLowerCase().includes(q) || p.path.includes(q));
  const groups = Array.from(new Set(shown.map((p) => p.group)));
  const shownCustom = custom.filter((p) => !q || p.name.toLowerCase().includes(q) || p.slug.includes(q));

  return (
    <PermissionGuard permission="seo.view">
      <div className="space-y-6">
        <PageHeader
          title="Pages"
          description="Edit the text on the homepage, About, FAQ, legal and neighborhood pages, and add new neighborhood pages"
          actions={
            view.mode === "list" && canEdit ? (
              <Button
                onClick={() => setView({ mode: "custom", key: null })}
                className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white flex items-center gap-2 text-xs font-medium"
              >
                <Plus className="w-4 h-4" /> New neighborhood page
              </Button>
            ) : null
          }
        />

        {view.mode === "builtin" && <BuiltInPageEditor pageKey={view.key} canEdit={canEdit} onBack={back} />}
        {view.mode === "custom" && (
          <CustomPageEditor
            key={view.key || "new"}
            pageKey={view.key}
            templates={templates}
            canEdit={canEdit}
            onBack={back}
            onSaved={(key) => setView({ mode: "custom", key })}
          />
        )}

        {view.mode === "list" && (
          <div className="space-y-6">
            <input
              className="w-full max-w-xs px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30"
              placeholder="Find a page…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Loading pages…</p>
            ) : (
              <>
                {(shownCustom.length > 0 || !q) && (
                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New neighborhood pages</h4>
                    {shownCustom.length === 0 ? (
                      <p className="text-xs text-muted-foreground">None yet. Use &quot;New neighborhood page&quot; to add one.</p>
                    ) : (
                      <div className="rounded-xl border border-border bg-card divide-y divide-border">
                        {shownCustom.map((p) => (
                          <Row
                            key={p.key}
                            label={p.name}
                            path={`/${p.slug}`}
                            badge={p.isPublished ? { text: "Live", tone: "ok" } : { text: "Hidden", tone: "muted" }}
                            sub={STATE_LABEL[p.state]}
                            onEdit={() => setView({ mode: "custom", key: p.key })}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}
                {groups.map((group) => (
                  <section key={group} className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</h4>
                    <div className="rounded-xl border border-border bg-card divide-y divide-border">
                      {shown
                        .filter((p) => p.group === group)
                        .map((p) => (
                          <Row
                            key={p.key}
                            label={p.label}
                            path={p.path}
                            badge={p.edited ? { text: "Edited", tone: "ok" } : undefined}
                            onEdit={() => setView({ mode: "builtin", key: p.key })}
                          />
                        ))}
                    </div>
                  </section>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}

function Row({
  label,
  path,
  badge,
  sub,
  onEdit,
}: {
  label: string;
  path: string;
  badge?: { text: string; tone: "ok" | "muted" };
  sub?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{label}</span>
          {badge && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                badge.tone === "ok" ? "bg-[#5A805B]/10 text-[#5A805B]" : "bg-neutral-500/10 text-neutral-600"
              }`}
            >
              {badge.text}
            </span>
          )}
          {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
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
      <Button type="button" variant="outline" size="sm" className="text-xs shrink-0" onClick={onEdit}>
        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
      </Button>
    </div>
  );
}
