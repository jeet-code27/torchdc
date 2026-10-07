import { z } from "zod";

export const productVariantSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  sku: z.string().optional().default(""),
  attributes: z.record(z.string(), z.string()).optional().default({}),
  wooId: z.union([z.string(), z.number()]).optional().nullable(),
});

export const productImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  publicId: z.string().optional().default(""),
  altText: z.string().optional().default(""),
  isPrimary: z.boolean().default(false),
});

export const productSeoSchema = z.object({
  metaTitle: z.string().max(80, "Meta title should be under 80 characters").optional().default(""),
  metaDescription: z.string().max(180, "Meta description should be under 180 characters").optional().default(""),
  focusKeyword: z.string().optional().default(""),
  canonicalUrl: z.string().optional().default(""),
  metaRobotsIndex: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").trim(),
  slug: z
    .string()
    .min(1, "Product slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .trim(),
  description: z.string().optional().default(""),
  shortDescription: z.string().optional().default(""),
  sku: z.string().optional().default(""),
  type: z.enum(["simple", "variable"]).default("simple"),
  price: z.coerce.number().min(0, "Price must be non-negative").default(0),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0).default(100),
  inStock: z.boolean().default(true),
  variants: z.array(productVariantSchema).optional().default([]),
  categoryIds: z.array(z.string()).optional().default([]),
  brand: z.string().optional().default(""),
  images: z.array(productImageSchema).optional().default([]),
  featured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
  wooId: z.union([z.string(), z.number()]).optional().nullable(),
  seo: productSeoSchema.default({
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    canonicalUrl: "",
    metaRobotsIndex: true,
  }),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductVariantValues = z.infer<typeof productVariantSchema>;
