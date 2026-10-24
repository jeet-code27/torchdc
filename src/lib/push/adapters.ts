/** Wires the push alert package to the site's own database helper and admin auth. */
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { canViewOrders } from "@/lib/orders/access";

export async function connectDB(): Promise<void> {
  await connectToDatabase();
}

/** The signed-in admin's user id, or null when not signed in or without an orders permission. */
export async function getAdminUserId(_req: Request): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user || !canViewOrders(user)) return null;
  return user.userId;
}
