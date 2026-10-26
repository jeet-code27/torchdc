/** "#1042" for new orders; older "TORCH-806546" numbers show as they are (never "#TORCH-..." or "##1042"). */
export function orderLabel(orderNumber: string) {
  const v = String(orderNumber || "").trim();
  if (/^#/.test(v) || /^[A-Za-z]/.test(v)) return v;
  return `#${v}`;
}
