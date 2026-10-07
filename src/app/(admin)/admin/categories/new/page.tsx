import { Metadata } from "next";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { CategoryForm } from "@/components/admin/categories/category-form";

export const metadata: Metadata = {
  title: "New Category | TORCH Admin",
  description: "Create a new product category with SEO metadata and Cloudinary media",
};

export default function NewCategoryPage() {
  return (
    <PermissionGuard permission="categories.create">
      <CategoryForm initialMode="create" />
    </PermissionGuard>
  );
}
