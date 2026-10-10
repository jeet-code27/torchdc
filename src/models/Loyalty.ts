import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoyaltyMember extends Document {
  customerId: string; // User ID or email
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  pointsBalance: number;
  lifetimePointsEarned: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  history: {
    type: "earned" | "redeemed" | "adjustment";
    points: number;
    description: string;
    orderId?: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LoyaltyMemberSchema = new Schema<ILoyaltyMember>(
  {
    customerId: { type: String, required: true, index: true },
    customerEmail: { type: String, required: true, lowercase: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    pointsBalance: { type: Number, default: 0, min: 0 },
    lifetimePointsEarned: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },
    history: [
      {
        type: { type: String, enum: ["earned", "redeemed", "adjustment"], required: true },
        points: { type: Number, required: true },
        description: { type: String, required: true },
        orderId: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

LoyaltyMemberSchema.index({ pointsBalance: -1 });

export const LoyaltyMember: Model<ILoyaltyMember> =
  mongoose.models.LoyaltyMember ||
  mongoose.model<ILoyaltyMember>("LoyaltyMember", LoyaltyMemberSchema);

export default LoyaltyMember;
