import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LoyaltyMember, User, Order, Role } from "@/models";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const perm = await requirePermission("loyalty.view");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const tier = searchParams.get("tier") || "all";

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ];
    }

    if (tier !== "all") query.tier = tier;

    let members = await LoyaltyMember.find(query).sort({ pointsBalance: -1 }).lean();

    // If loyalty collection is empty or fresh, auto-populate from existing customers/orders
    if (members.length === 0 && !search && tier === "all") {
      const customerRole = await Role.findOne({ key: "customer" }).lean();
      const userFilter = customerRole ? { role: customerRole._id, isDeleted: false } : { isDeleted: false };
      const users = await User.find(userFilter).limit(10).lean();
      for (const u of users) {
        const orderCount = await Order.countDocuments({
          $or: [{ customerId: u._id.toString() }, { customerEmail: u.email.toLowerCase() }],
        });
        const points = (orderCount || 1) * 150;
        await LoyaltyMember.create({
          customerId: u._id.toString(),
          customerEmail: u.email.toLowerCase(),
          customerName: u.name,
          customerPhone: u.phone || "",
          pointsBalance: points,
          lifetimePointsEarned: points + 50,
          tier: points > 500 ? "Gold" : points > 200 ? "Silver" : "Bronze",
          history: [
            {
              type: "earned",
              points,
              description: "Welcome signup bonus & initial order rewards",
              createdAt: new Date(),
            },
          ],
        });
      }
      members = await LoyaltyMember.find(query).sort({ pointsBalance: -1 }).lean();
    }

    const allMembers = await LoyaltyMember.find().lean();
    const stats = {
      totalMembers: allMembers.length,
      totalPointsInCirculation: allMembers.reduce((sum, m) => sum + (m.pointsBalance || 0), 0),
      totalLifetimeEarned: allMembers.reduce((sum, m) => sum + (m.lifetimePointsEarned || 0), 0),
      tierCounts: {
        Bronze: allMembers.filter((m) => m.tier === "Bronze").length,
        Silver: allMembers.filter((m) => m.tier === "Silver").length,
        Gold: allMembers.filter((m) => m.tier === "Gold").length,
        Platinum: allMembers.filter((m) => m.tier === "Platinum").length,
      },
    };

    return NextResponse.json({
      success: true,
      members: members.map((m) => ({ ...m, _id: m._id.toString() })),
      stats,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/loyalty error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const perm = await requirePermission("loyalty.manage");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const body = await req.json();
    const { memberId, pointsDelta, reason, newTier } = body;

    if (!memberId || pointsDelta === undefined) {
      return NextResponse.json(
        { success: false, error: "Member ID and points adjustment value are required" },
        { status: 400 }
      );
    }

    const member = await LoyaltyMember.findById(memberId);
    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    const delta = Number(pointsDelta) || 0;
    const newBalance = Math.max(0, member.pointsBalance + delta);
    member.pointsBalance = newBalance;
    if (delta > 0) {
      member.lifetimePointsEarned += delta;
    }

    if (newTier && ["Bronze", "Silver", "Gold", "Platinum"].includes(newTier)) {
      member.tier = newTier;
    }

    member.history.push({
      type: "adjustment",
      points: delta,
      description: reason || "Manual admin adjustment",
      createdAt: new Date(),
    });

    await member.save();
    return NextResponse.json({ success: true, member });
  } catch (error: unknown) {
    console.error("POST /api/admin/loyalty error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
