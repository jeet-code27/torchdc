import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StoreSettings } from "@/models/StoreSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    let settings = await StoreSettings.findOne({ key: "default" }).lean();
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
      settings: {
        pickupEnabled: Boolean(settings.pickupEnabled),
        deliveryEnabled: Boolean(settings.deliveryEnabled),
        pickupPausedTitle:
          settings.pickupPausedTitle || "Pickup is paused right now",
        pickupPausedMessage:
          settings.pickupPausedMessage ||
          "We'll deliver it free, with a pre-roll on us.",
      },
    });
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return NextResponse.json(
      {
        success: false,
        settings: {
          pickupEnabled: false,
          deliveryEnabled: true,
          pickupPausedTitle: "Pickup is paused right now",
          pickupPausedMessage: "We'll deliver it free, with a pre-roll on us.",
        },
      },
      { status: 500 }
    );
  }
}
