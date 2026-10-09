import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import { Cart } from "@/models/Cart";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, sessionId } = body;

    // 1. Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (minimum 2 characters)" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Phone validation (10 digits US format)
    const digitsOnly = String(phone || "").replace(/\D/g, "");
    if (!phone || digitsOnly.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit phone number (e.g. 202-555-0143)" },
        { status: 400 }
      );
    }

    // Format phone nicely: (XXX) XXX-XXXX or clean 10 digits
    const cleanPhone = digitsOnly.length === 11 && digitsOnly.startsWith("1")
      ? digitsOnly.slice(1)
      : digitsOnly.slice(-10);

    const formattedPhone = `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if email already registered
    const existingEmail = await User.findOne({
      email: normalizedEmail,
      isDeleted: false,
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 3. Check if phone already registered
    const existingPhone = await User.findOne({
      $or: [
        { phone: formattedPhone },
        { phone: cleanPhone },
      ],
      isDeleted: false,
    });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: "An account with this phone number already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 4. Ensure "customer" role exists in DB
    let customerRole = await Role.findOne({ key: "customer" });
    if (!customerRole) {
      customerRole = await Role.create({
        name: "Customer",
        key: "customer",
        permissions: [],
        isSystem: true,
      });
    }

    // 5. Hash password & create user
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: formattedPhone,
      passwordHash,
      role: customerRole._id,
      isActive: true,
      isDeleted: false,
    });

    // 6. Merge guest session cart if present
    if (sessionId) {
      try {
        await Cart.updateMany(
          { sessionId, status: "active" },
          { $set: { userId: newUser._id } }
        );
      } catch (cartMergeErr) {
        console.error("Cart merge during registration error:", cartMergeErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully! You can now sign in.",
      user: {
        id: String(newUser._id),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
