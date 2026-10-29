import mongoose, { Schema, Document, Model } from "mongoose";

/** Search settings edited on Admin › SEO (one document, key "default"). */
export interface IPageSeo {
  title?: string;
  description?: string;
  noindex?: boolean;
}

export interface ISeoSettings extends Document {
  key: string;
  /** Google Search Console "HTML tag" content value */
  googleVerification?: string;
  /** Bing Webmaster Tools "msvalidate.01" content value */
  bingVerification?: string;
  /** Image used when a page is shared (link previews), absolute URL or /path */
  defaultShareImage?: string;
  /** Overrides per page key (see src/lib/seo-pages.ts) */
  pages: Map<string, IPageSeo>;
  updatedAt: Date;
}

const PageSeoSchema = new Schema<IPageSeo>(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    noindex: { type: Boolean, default: false },
  },
  { _id: false }
);

const SeoSettingsSchema = new Schema<ISeoSettings>(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    googleVerification: { type: String, default: "" },
    bingVerification: { type: String, default: "" },
    defaultShareImage: { type: String, default: "" },
    pages: { type: Map, of: PageSeoSchema, default: {} },
  },
  { timestamps: true }
);

export const SeoSettings: Model<ISeoSettings> =
  mongoose.models.SeoSettings || mongoose.model<ISeoSettings>("SeoSettings", SeoSettingsSchema);
