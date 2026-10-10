import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author: string;
  category?: string;
  tags: string[];
  readTimeMinutes: number;
  isPublished: boolean;
  publishedAt?: Date;
  featured: boolean;
  seo?: IBlogSEO;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    author: { type: String, default: "Torch Team" },
    category: { type: String, default: "Cannabis Education" },
    tags: [{ type: String }],
    readTimeMinutes: { type: Number, default: 3 },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    featured: { type: Boolean, default: false },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      focusKeyword: { type: String },
      canonicalUrl: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

BlogSchema.index({ isPublished: 1, publishedAt: -1 });

export const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
