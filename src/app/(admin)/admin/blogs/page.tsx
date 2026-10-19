"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface BlogItem {
  _id: string;
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
  publishedAt?: string;
  featured: boolean;
  createdAt?: string;
}

export default function BlogsManagementPage() {
  const [blogs, setBlogs] = React.useState<BlogItem[]>([]);
  const [stats, setStats] = React.useState({ totalPosts: 0, publishedPosts: 0, draftPosts: 0 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "published" | "draft">("all");

  // Delete state
  const [deleteBlog, setDeleteBlog] = React.useState<BlogItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchBlogs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/blogs?search=${encodeURIComponent(search)}&status=${statusFilter}`
      );
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs || []);
        setStats(data.stats || { totalPosts: 0, publishedPosts: 0, draftPosts: 0 });
      } else {
        toast.error(data.error || "Failed to load blog posts");
      }
    } catch {
      toast.error("Failed to connect to blogs API");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleTogglePublish = async (blog: BlogItem) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blog._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !blog.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Article is now ${!blog.isPublished ? "Published" : "Draft"}`);
        setBlogs((prev) =>
          prev.map((b) => (b._id === blog._id ? { ...b, isPublished: !b.isPublished } : b))
        );
      }
    } catch {
      toast.error("Failed to update post status");
    }
  };

  const handleDelete = async () => {
    if (!deleteBlog) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs/${deleteBlog._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Article deleted");
        setDeleteBlog(null);
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to delete article");
      }
    } catch {
      toast.error("Failed to delete blog post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PermissionGuard permission="blogs.view">
      <div className="space-y-6">
        <PageHeader
          title="Blog & Articles"
          description="Publish cannabis guides, strain spotlights, and Washington D.C. legal educational content"
          actions={
            <Button asChild className="flex items-center gap-2 font-medium text-xs">
              <Link href="/admin/blogs/new">
                <Plus className="w-4 h-4" />
                Write Article
              </Link>
            </Button>
          }
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#5A805B]/10 text-[#5A805B]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Total Posts
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Live Published
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.publishedPosts}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-muted text-muted-foreground">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Drafts
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.draftPosts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles by title, author, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted text-xs font-semibold">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "published" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "draft" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Blog Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Loading articles...</div>
          ) : blogs.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-foreground">No articles found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Write educational cannabis strain reviews and dispensary stories to drive SEO traffic.
              </p>
              <Button asChild className="mt-4 text-xs">
                <Link href="/admin/blogs/new">Create Article</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Read Time</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {blogs.map((b) => (
                    <tr key={b._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {b.coverImage ? (
                            <div className="w-12 h-10 rounded-lg overflow-hidden relative shrink-0 border border-border">
                              <Image
                                src={b.coverImage}
                                alt={b.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <Link href={`/admin/blogs/${b._id}`} className="font-semibold text-foreground line-clamp-1 hover:text-primary">
                              {b.title}
                            </Link>
                            <p className="text-xs font-mono text-muted-foreground">/{b.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                          {b.category || "General"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                        {b.author}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {b.readTimeMinutes} min
                      </td>
                      <td className="py-3.5 px-4">
                        {b.featured ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button onClick={() => handleTogglePublish(b)} className="cursor-pointer">
                          <StatusBadge variant={b.isPublished ? "success" : "muted"}>
                            {b.isPublished ? "Published" : "Draft"}
                          </StatusBadge>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit article">
                            <Link href={`/admin/blogs/${b._id}`}>
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteBlog(b)}
                            className="h-8 w-8 p-0 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={Boolean(deleteBlog)}
          onOpenChange={(open) => !open && setDeleteBlog(null)}
          title="Delete Article"
          description={`Are you sure you want to delete article "${deleteBlog?.title}"? This cannot be undone.`}
          confirmText="Delete Article"
          isLoading={isDeleting}
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>
    </PermissionGuard>
  );
}
