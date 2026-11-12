import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Page copy edited on Admin › Pages.
 *
 * Built-in pages (key "home", "about", "faq", "terms", "privacy", "area:<slug>") store only what was
 * changed: an empty body means the page shows the client's built-in copy.
 * New neighborhood pages (custom: true, key "area:<slug>") hold everything the page needs.
 */
export interface ISitePageFaq {
  q: string;
  a: string;
}

export interface ISitePage extends Document {
  key: string;
  /** Page body HTML (homepage: the intro paragraphs under the banner) */
  body: string;
  /** Homepage only: fact chips under the intro */
  chips: string[];
  /** Homepage only: FAQ questions and answers (answers may contain links) */
  faq: ISitePageFaq[];
  // New neighborhood pages
  custom: boolean;
  slug: string;
  name: string;
  state: "DC" | "MD" | "VA" | "";
  title: string;
  description: string;
  isPublished: boolean;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<ISitePageFaq>({ q: { type: String, default: "" }, a: { type: String, default: "" } }, { _id: false });

const SitePageSchema = new Schema<ISitePage>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    body: { type: String, default: "" },
    chips: { type: [String], default: [] },
    faq: { type: [FaqSchema], default: [] },
    custom: { type: Boolean, default: false, index: true },
    slug: { type: String, default: "", lowercase: true, trim: true },
    name: { type: String, default: "", trim: true },
    state: { type: String, enum: ["DC", "MD", "VA", ""], default: "" },
    title: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    isPublished: { type: Boolean, default: false },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SitePage: Model<ISitePage> =
  mongoose.models.SitePage || mongoose.model<ISitePage>("SitePage", SitePageSchema);
