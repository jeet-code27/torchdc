import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProductVariant {
  name: string;
  price: number;
  salePrice?: number;
  stock?: number;
  inStock: boolean;
  sku?: string;
  attributes?: Record<string, string>;
  wooId?: string | number;
}

export interface IProductImage {
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface IProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  metaRobotsIndex: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  type: "simple" | "variable";
  price: number;
  salePrice?: number;
  stock: number;
  inStock: boolean;
  variants: IProductVariant[];
  categoryIds: Types.ObjectId[];
  brand?: string;
  images: IProductImage[];
  featured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  wooId?: string | number | null;
  seo: IProductSEO;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    sku: { type: String, default: "" },
    attributes: { type: Map, of: String, default: {} },
    wooId: { type: Schema.Types.Mixed, default: null },
  },
  { _id: true }
);

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    altText: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    sku: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["simple", "variable"],
      default: "simple",
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      default: 100,
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    variants: [ProductVariantSchema],
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        index: true,
      },
    ],
    brand: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    images: [ProductImageSchema],
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    wooId: {
      type: Schema.Types.Mixed,
      default: null,
      index: true,
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

// Full-text search index on name, description, brand, focusKeyword
ProductSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  "seo.focusKeyword": "text",
});

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
