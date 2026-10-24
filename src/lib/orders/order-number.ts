import mongoose from "mongoose";

/**
 * Short sequential order numbers: #1001, #1002, ...
 * Atomic (one update on a counters document), so two checkouts at the same second never collide.
 * Older orders keep their TORCH-xxxxxx numbers; only new orders use this.
 */
const START_AT = 1001;

export async function nextOrderNumber(): Promise<string> {
  const counters = mongoose.connection.collection<{ _id: string; seq: number }>("counters");
  const doc = await counters.findOneAndUpdate(
    { _id: "orderNumber" },
    [{ $set: { seq: { $add: [{ $ifNull: ["$seq", START_AT - 1] }, 1] } } }],
    { upsert: true, returnDocument: "after" }
  );
  const seq = doc?.seq;
  if (typeof seq !== "number") throw new Error("Could not allocate an order number");
  return `#${seq}`;
}

/**
 * Every stored form a typed order number can have: "1042", "#1042", "TORCH-806546" and "806546"
 * all find their order.
 */
export function orderNumberCandidates(input: string): string[] {
  const raw = input.trim().toUpperCase();
  if (!raw) return [];
  const bare = raw.replace(/^#/, "").replace(/^TORCH-/, "");
  return Array.from(new Set([raw, `#${bare}`, `TORCH-${bare}`]));
}

/** Escape user text before putting it in a RegExp (search boxes). */
export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
