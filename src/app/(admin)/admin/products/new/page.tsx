import { Metadata } from "next";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { ProductForm } from "@/components/admin/products/product-form";

export const metadata: Metadata = {
  title: "New Product | TORCH Admin",
  description: "Create a new product with Google SEO indexing and variations",
};

export default function NewProductPage() {
  return (
    <PermissionGuard permission="products.create">
      <ProductForm initialMode="create" />
    </PermissionGuard>
  );
}
