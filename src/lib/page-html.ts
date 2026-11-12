/**
 * Small helpers for page HTML edited in the admin (no database, safe in the browser).
 */
export type FaqItem = { q: string; a: string };

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'", "&nbsp;": " " };

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Text of an HTML snippet (tags removed, common entities decoded, spaces collapsed) */
export function htmlText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|lt|gt|quot|nbsp|#39|#x27);/g, (m) => ENTITIES[m] || m)
    .replace(/\s+/g, " ")
    .trim();
}

/** Questions on a page: every <details><summary>Question</summary>Answer</details> */
export function faqFromHtml(html: string): FaqItem[] {
  const out: FaqItem[] = [];
  const re = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const q = htmlText(m[1]);
    const a = m[2].trim();
    if (q && htmlText(a)) out.push({ q, a });
  }
  return out;
}

/** The page's first <h1> with its text replaced (attributes kept). Unchanged when h1 is empty. */
export function withH1(html: string, h1: string): string {
  const text = h1.trim();
  if (!text) return html;
  return html.replace(/<h1([^>]*)>[\s\S]*?<\/h1>/i, (_m, attrs: string) => `<h1${attrs}>${escapeHtml(text)}</h1>`);
}

/** Text of the first <h1> */
export function firstH1(html: string): string {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? htmlText(m[1]) : "";
}

/**
 * Admin-written HTML, made safe to put on the page: scripts, iframes, forms, inline event handlers
 * and javascript: links are removed. Everything else (classes, links, sections) is kept.
 */
export function cleanPageHtml(html: string): string {
  return String(html || "")
    .replace(/<\s*(script|style|iframe|object|embed|textarea|select|button)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, "")
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|input|textarea|select|button|link|meta|base)\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*(javascript|data|vbscript):[^"']*\2/gi, '$1="#"')
    .trim();
}
