import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICategoryImage {
  url?: string;
  publicId?: string;
  altText?: string;
}

export interface ICategorySEO {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  metaRobotsIndex: boolean;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: Types.ObjectId | ICategory | null;
  image?: ICategoryImage;
  displayOrder: number;
  isActive: boolean;
  wooId?: number | string;
  seo: ICategorySEO;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      altText: { type: String, default: "" },
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    wooId: {
      type: Schema.Types.Mixed,
      index: true,
      default: null,
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      focusKeyword: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
      metaRobotsIndex: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-fill default SEO values before saving if left empty
CategorySchema.pre("save", function () {
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = `Buy ${this.name} in Washington DC | TORCH Dispensary`;
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = `Shop fresh, premium ${this.name} in Washington DC at Torch Dispensary. Fast local cannabis delivery and store pickup available.`;
  }
  if (!this.seo.focusKeyword) {
    this.seo.focusKeyword = `${this.name} Washington DC`;
  }
});

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
