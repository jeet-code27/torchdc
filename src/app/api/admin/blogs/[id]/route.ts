import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Blog } from "@/models";
import { requirePermission } from "@/lib/permissions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const perm = await requirePermission("blogs.view");
    if (!perm.authorized) return perm.response;

    const { id } = await params;
    await connectDB();
    const blog = await Blog.findById(id).lean();
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, blog });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const perm = await requirePermission("blogs.edit");
    if (!perm.authorized) return perm.response;

    const { id } = await params;
    await connectDB();
    const body = await req.json();

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    if (body.title !== undefined) blog.title = body.title.trim();
    if (body.slug !== undefined) {
      blog.slug = body.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }
    if (body.excerpt !== undefined) blog.excerpt = body.excerpt;
    if (body.content !== undefined) blog.content = body.content;
    if (body.coverImage !== undefined) blog.coverImage = body.coverImage;
    if (body.author !== undefined) blog.author = body.author;
    if (body.category !== undefined) blog.category = body.category;
    if (body.readTimeMinutes !== undefined) blog.readTimeMinutes = Number(body.readTimeMinutes) || 3;
    if (body.featured !== undefined) blog.featured = Boolean(body.featured);
    if (body.seo !== undefined) {
      blog.seo = {
        metaTitle: body.seo?.metaTitle?.trim() || "",
        metaDescription: body.seo?.metaDescription?.trim() || "",
        focusKeyword: body.seo?.focusKeyword?.trim() || "",
        canonicalUrl: blog.seo?.canonicalUrl || "",
      };
    }

    if (body.tags !== undefined) {
      blog.tags = Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === "string"
        ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];
    }

    if (body.isPublished !== undefined) {
      const willPublish = Boolean(body.isPublished);
      if (willPublish && !blog.isPublished) {
        blog.publishedAt = new Date();
      }
      blog.isPublished = willPublish;
    }

    const oldSlug = (await Blog.findById(id).select("slug").lean())?.slug;
    await blog.save();
    // Posts are cached pages at the site root (/<slug>); refresh them and the list right away
    revalidateBlog(blog.slug, oldSlug);
    return NextResponse.json({ success: true, blog });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const perm = await requirePermission("blogs.delete");
    if (!perm.authorized) return perm.response;

    const { id } = await params;
    await connectDB();
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }
    revalidateBlog(blog.slug);

    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

function revalidateBlog(...slugs: (string | undefined)[]) {
  for (const slug of new Set(slugs.filter(Boolean))) revalidatePath(`/${slug}`);
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
}
