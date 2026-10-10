import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRedirect extends Document {
  sourceUrl: string;
  targetUrl: string;
  statusCode: 301 | 302;
  isActive: boolean;
  hits: number;
  lastAccessedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RedirectSchema = new Schema<IRedirect>(
  {
    sourceUrl: { type: String, required: true, unique: true, trim: true, lowercase: true },
    targetUrl: { type: String, required: true, trim: true },
    statusCode: { type: Number, enum: [301, 302], default: 301 },
    isActive: { type: Boolean, default: true, index: true },
    hits: { type: Number, default: 0 },
    lastAccessedAt: { type: Date },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const Redirect: Model<IRedirect> =
  mongoose.models.Redirect || mongoose.model<IRedirect>("Redirect", RedirectSchema);

export default Redirect;
