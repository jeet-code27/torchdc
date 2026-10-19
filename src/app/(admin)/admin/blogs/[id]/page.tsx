import { Metadata } from "next";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { BlogEditor } from "@/components/admin/blogs/blog-editor";

export const metadata: Metadata = {
  title: "Edit Article | TORCH Admin",
};

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;

  return (
    <PermissionGuard permission="blogs.edit">
      <BlogEditor blogId={id} />
    </PermissionGuard>
  );
}
