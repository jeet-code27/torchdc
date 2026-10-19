import { Metadata } from "next";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { BlogEditor } from "@/components/admin/blogs/blog-editor";

export const metadata: Metadata = {
  title: "Write Article | TORCH Admin",
};

export default function NewBlogPage() {
  return (
    <PermissionGuard permission="blogs.create">
      <BlogEditor />
    </PermissionGuard>
  );
}
