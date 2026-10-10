"use client";

import * as React from "react";
import Image from "next/image";
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
  Send,
  XCircle,
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

  // Dialog state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBlog, setEditingBlog] = React.useState<BlogItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "Torch Team",
    category: "Cannabis Education",
    tags: "Guide, Washington DC, Cannabis",
    readTimeMinutes: 4,
    isPublished: true,
    featured: false,
  });

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

  const openCreateModal = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      author: "Torch Team",
      category: "Cannabis Education",
      tags: "Guide, Washington DC, Cannabis",
      readTimeMinutes: 4,
      isPublished: true,
      featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: BlogItem) => {
    setEditingBlog(b);
    setFormData({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || "",
      content: b.content,
      coverImage: b.coverImage || "",
      author: b.author || "Torch Team",
      category: b.category || "Cannabis Education",
      tags: Array.isArray(b.tags) ? b.tags.join(", ") : "",
      readTimeMinutes: b.readTimeMinutes || 4,
      isPublished: b.isPublished,
      featured: b.featured,
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !editingBlog
        ? val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error("Title, slug, and article content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingBlog ? `/api/admin/blogs/${editingBlog._id}` : "/api/admin/blogs";
      const method = editingBlog ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingBlog ? "Article updated!" : "Article published!");
        setIsModalOpen(false);
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to save article");
      }
    } catch {
      toast.error("Error saving blog article");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Button
              onClick={openCreateModal}
              className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white flex items-center gap-2 font-medium text-xs"
            >
              <Plus className="w-4 h-4" />
              Write Article
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
              <div className="p-2.5 rounded-lg bg-neutral-500/10 text-neutral-600">
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
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "all" ? "bg-white text-neutral-900 shadow-sm" : "text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "published" ? "bg-white text-neutral-900 shadow-sm" : "text-muted-foreground"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "draft" ? "bg-white text-neutral-900 shadow-sm" : "text-muted-foreground"
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
                Write educational cannabis strain reviews and Initiative 71 compliance stories to drive SEO traffic.
              </p>
              <Button
                onClick={openCreateModal}
                className="mt-4 bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs"
              >
                Create Article
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
                            <div className="w-12 h-10 rounded-lg overflow-hidden relative shrink-0 border border-neutral-200">
                              <Image
                                src={b.coverImage}
                                alt={b.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground line-clamp-1">{b.title}</p>
                            <p className="text-xs font-mono text-muted-foreground">/{b.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
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
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(b)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4 text-neutral-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteBlog(b)}
                            className="h-8 w-8 p-0 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 text-neutral-600 hover:text-red-600" />
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

        {/* Create / Edit Modal Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingBlog ? "Edit Article" : "Write New Article"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Draft or publish SEO-optimized cannabis editorial content
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Article Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Complete Guide to Washington D.C. Cannabis Gifting & Delivery"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Slug URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. dc-cannabis-delivery-guide"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                    >
                      <option value="Cannabis Education">Cannabis Education</option>
                      <option value="Strain Spotlight">Strain Spotlight</option>
                      <option value="DC Culture & Lifestyle">DC Culture & Lifestyle</option>
                      <option value="Product Reviews">Product Reviews</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Read Time (minutes)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.readTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, readTimeMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Short Excerpt (Summary)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence preview for search results and social cards..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Article Body Content (Markdown supported) *</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Write your article content here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Flower, Sativa, DC Delivery, Guide"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="rounded text-[#5A805B] focus:ring-[#5A805B]"
                    />
                    Publish immediately (Visible on website)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-[#5A805B] focus:ring-[#5A805B]"
                    />
                    Featured on Blog Homepage
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs font-medium"
                  >
                    {isSubmitting ? "Saving..." : editingBlog ? "Save Changes" : "Publish Article"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
