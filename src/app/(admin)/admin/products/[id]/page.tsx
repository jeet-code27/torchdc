import { Metadata } from "next";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { ProductForm } from "@/components/admin/products/product-form";

export const metadata: Metadata = {
  title: "Edit Product | TORCH Admin",
  description: "Edit product details, variations, media gallery, and SEO metadata",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return (
    <PermissionGuard permission="products.view">
      <ProductForm productId={id} initialMode="edit" />
    </PermissionGuard>
  );
}
