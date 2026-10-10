import { NextRequest, NextResponse } from "next/server";
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

    await blog.save();
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

    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
