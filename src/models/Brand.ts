import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBrandSEO {
  metaTitle?: string;
  metaDescription?: string;
}

export interface IBrand extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  featured: boolean;
  displayOrder: number;
  seo?: IBrandSEO;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logoUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    website: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

BrandSchema.index({ name: 1 });

export const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);

export default Brand;
