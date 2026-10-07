import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(80),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  image: z
    .object({
      url: z.string().optional(),
      publicId: z.string().optional(),
      altText: z.string().optional(),
    })
    .optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean(),
  seo: z.object({
    metaTitle: z.string().max(100, "Meta title should be under 100 characters").optional(),
    metaDescription: z.string().max(250, "Meta description should be under 250 characters").optional(),
    focusKeyword: z.string().optional(),
    canonicalUrl: z.string().optional(),
    metaRobotsIndex: z.boolean(),
  }),
});

export type CategoryInput = z.infer<typeof categorySchema>;
