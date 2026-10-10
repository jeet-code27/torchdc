import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Blog } from "@/models";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const perm = await requirePermission("blogs.view");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "published") query.isPublished = true;
    if (status === "draft") query.isPublished = false;

    const blogs = await Blog.find(query).sort({ createdAt: -1 }).lean();

    const stats = {
      totalPosts: blogs.length,
      publishedPosts: blogs.filter((b) => b.isPublished).length,
      draftPosts: blogs.filter((b) => !b.isPublished).length,
    };

    return NextResponse.json({
      success: true,
      blogs: blogs.map((b) => ({ ...b, _id: b._id.toString() })),
      stats,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/blogs error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const perm = await requirePermission("blogs.create");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      category,
      tags,
      readTimeMinutes,
      isPublished,
      featured,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const existing = await Blog.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An article with this slug already exists" },
        { status: 409 }
      );
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug: cleanSlug,
      excerpt: excerpt || "",
      content,
      coverImage: coverImage || "",
      author: author || "Torch Team",
      category: category || "Cannabis Education",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      readTimeMinutes: Number(readTimeMinutes) || 3,
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : undefined,
      featured: Boolean(featured),
    });

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/blogs error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
