import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { StoreSettings } from "@/models/StoreSettings";
import { ActivityLog } from "@/models/ActivityLog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let settings = await StoreSettings.findOne({ key: "default" });
    if (!settings) {
      settings = await StoreSettings.create({
        key: "default",
        pickupEnabled: false,
        deliveryEnabled: true,
        pickupPausedTitle: "Pickup is paused right now",
        pickupPausedMessage: "We'll deliver it free, with a pre-roll on us.",
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("Error fetching admin store settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await req.json();

    const updates: Record<string, any> = {};
    if (typeof body.pickupEnabled === "boolean") {
      updates.pickupEnabled = body.pickupEnabled;
    }
    if (typeof body.deliveryEnabled === "boolean") {
      updates.deliveryEnabled = body.deliveryEnabled;
    }
    if (typeof body.pickupPausedTitle === "string") {
      updates.pickupPausedTitle = body.pickupPausedTitle.trim();
    }
    if (typeof body.pickupPausedMessage === "string") {
      updates.pickupPausedMessage = body.pickupPausedMessage.trim();
    }

    const updated = await StoreSettings.findOneAndUpdate(
      { key: "default" },
      { $set: updates },
      { upsert: true, returnDocument: "after" }
    );

    // Log admin activity
    try {
      await ActivityLog.create({
        action: "store_settings.update",
        description: `Updated store fulfillment settings. Pickup enabled: ${updated.pickupEnabled}`,
        actor: {
          userId: user.userId,
          name: user.name || "Admin",
          email: user.email || "admin@torch.com",
          role: user.role || "admin",
        },
        entityType: "system",
        entityId: updated._id.toString(),
      });
    } catch (e) {
      // ignore log error
    }

    return NextResponse.json({
      success: true,
      message: "Store settings updated successfully",
      settings: updated,
    });
  } catch (error: any) {
    console.error("Error updating admin store settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
