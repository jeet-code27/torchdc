import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoreSettings extends Document {
  key: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  pickupPausedTitle: string;
  pickupPausedMessage: string;
  updatedAt: Date;
  createdAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    key: { type: String, default: "default", unique: true },
    pickupEnabled: { type: Boolean, default: false },
    deliveryEnabled: { type: Boolean, default: true },
    pickupPausedTitle: {
      type: String,
      default: "Pickup is paused right now",
    },
    pickupPausedMessage: {
      type: String,
      default: "We'll deliver it free, with a pre-roll on us.",
    },
  },
  { timestamps: true }
);

export const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);
