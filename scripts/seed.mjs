import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ALL_PERMISSIONS = [
  "dashboard.view",
  "products.view",
  "products.create",
  "products.edit",
  "products.delete",
  "products.seo",
  "categories.view",
  "categories.create",
  "categories.edit",
  "categories.delete",
  "categories.seo",
  "brands.view",
  "brands.create",
  "brands.edit",
  "brands.delete",
  "orders.view",
  "orders.manage",
  "deals.view",
  "deals.manage",
  "customers.view",
  "customers.manage",
  "loyalty.view",
  "loyalty.manage",
  "blogs.view",
  "blogs.create",
  "blogs.edit",
  "blogs.delete",
  "blogs.publish",
  "seo.view",
  "seo.manage",
  "staff.view",
  "staff.manage",
  "roles.manage",
  "activity.view",
];

const SYSTEM_ROLES = [
  {
    key: "super_admin",
    name: "Super Administrator",
    permissions: [...ALL_PERMISSIONS],
    isSystem: true,
  },
  {
    key: "admin",
    name: "Administrator",
    permissions: [
      "dashboard.view",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.seo",
      "categories.view",
      "categories.create",
      "categories.edit",
      "categories.delete",
      "categories.seo",
      "brands.view",
      "brands.create",
      "brands.edit",
      "brands.delete",
      "orders.view",
      "orders.manage",
      "deals.view",
      "deals.manage",
      "customers.view",
      "loyalty.view",
      "blogs.view",
      "blogs.create",
      "blogs.edit",
      "blogs.delete",
      "blogs.publish",
      "seo.view",
    ],
    isSystem: true,
  },
  {
    key: "seo",
    name: "SEO Specialist",
    permissions: [
      "dashboard.view",
      "blogs.view",
      "blogs.create",
      "blogs.edit",
      "blogs.delete",
      "blogs.publish",
      "seo.view",
      "seo.manage",
      "products.view",
      "products.seo",
      "categories.view",
      "categories.seo",
    ],
    isSystem: true,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in environment variables!");
    process.exit(1);
  }

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@torch.com").toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "TorchAdminPassword123!";

  console.log("🌱 Connecting to MongoDB to seed initial roles & super admin...");
  await mongoose.connect(uri);

  const RoleSchema = new mongoose.Schema(
    {
      name: String,
      key: { type: String, unique: true },
      permissions: [String],
      isSystem: Boolean,
    },
    { timestamps: true }
  );

  const UserSchema = new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true },
      passwordHash: String,
      role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
      isActive: { type: Boolean, default: true },
      isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  console.log("Creating or updating 3 system roles...");
  const roleMap = {};

  for (const roleDef of SYSTEM_ROLES) {
    const roleDoc = await Role.findOneAndUpdate(
      { key: roleDef.key },
      {
        $set: {
          name: roleDef.name,
          permissions: roleDef.permissions,
          isSystem: roleDef.isSystem,
        },
      },
      { upsert: true, new: true }
    );
    roleMap[roleDef.key] = roleDoc;
    console.log(`  ✓ Role "${roleDef.key}" (${roleDef.permissions.length} permissions) synced.`);
  }

  console.log(`Creating or updating super admin user: ${adminEmail}`);
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const superAdminRole = roleMap["super_admin"];
  if (!superAdminRole) {
    throw new Error("Super admin role was not created!");
  }

  const superAdmin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        name: "Torch Super Admin",
        email: adminEmail,
        passwordHash: passwordHash,
        role: superAdminRole._id,
        isActive: true,
        isDeleted: false,
      },
    },
    { upsert: true, new: true }
  );

  console.log(`  ✓ Super Admin ready: ${superAdmin.email} (ID: ${superAdmin._id})`);
  console.log("\n✅ Database seeding completed successfully!");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});
