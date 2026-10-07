import { Metadata } from "next";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { CategoryForm } from "@/components/admin/categories/category-form";

export const metadata: Metadata = {
  title: "Edit Category | TORCH Admin",
  description: "Edit category details, Cloudinary media, and Google SEO metadata",
};

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;

  return (
    <PermissionGuard permission="categories.view">
      <CategoryForm categoryId={id} initialMode="edit" />
    </PermissionGuard>
  );
}
