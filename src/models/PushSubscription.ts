import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const PushSubscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    reminders: { type: Boolean, default: true }, // "Remind if not confirmed" setting
    userAgent: { type: String },
    lastSuccessAt: { type: Date },
  },
  { timestamps: true }
);

export type PushSubscriptionDoc = InferSchemaType<typeof PushSubscriptionSchema>;

export const PushSubscriptionModel: Model<PushSubscriptionDoc> =
  (mongoose.models.PushSubscription as Model<PushSubscriptionDoc>) ||
  mongoose.model<PushSubscriptionDoc>('PushSubscription', PushSubscriptionSchema);
