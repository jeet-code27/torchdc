export const ALL_PERMISSIONS = [
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
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number];

export const ROLE_PRESETS = {
  SUPER_ADMIN: {
    key: "super_admin",
    name: "Super Administrator",
    permissions: [...ALL_PERMISSIONS],
    isSystem: true,
  },
  ADMIN: {
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
    ] as PermissionKey[],
    isSystem: true,
  },
  SEO: {
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
    ] as PermissionKey[],
    isSystem: true,
  },
} as const;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface NavItem {
  title: string;
  href?: string;
  icon: string;
  permission?: PermissionKey;
  children?: {
    title: string;
    href: string;
    permission?: PermissionKey;
  }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
