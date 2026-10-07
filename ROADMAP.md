# TORCH Admin Portal — Development Roadmap & Implementation Plan

> **Store:** TORCH (Washington DC — Premium CBD & Hemp Dispensary)  
> **Brand Color:** `#5A805B` (Green) | **Neutrals:** Black & White  
> **Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, MongoDB + Mongoose, Auth.js (NextAuth v5), react-hot-toast, Zod, TanStack Table v8.

---

## 📊 Roadmap Overview & Status Tracker

| Step | Module | Scope | Status |
| :--- | :--- | :--- | :---: |
| **Step 1** | **Project Setup & Admin Shell** | Next.js 16, Tailwind, Design Tokens, Admin Shell, Sidebar, Responsive Drawer, Toast |  **Completed** |
| **Step 2** | **Auth & RBAC Foundation** | Role/User Models, Seeding, Login, JWT Session, Proxy/Middleware, `<Can />`, 403 Page |  **Completed** |
| **Step 3** | **Staff & Roles** | Staff CRUD, Passwords, Role Permission Matrix, Super Admin Security Lock |  **Completed** |
| **Step 4** | **Customers Module** | Customer Directory, Search, Filters, Detail Drawer (Orders, Addresses, Lifetime Stats) | 📋 Planned |
| **Step 5** | **Categories Module** | Tree Hierarchy, Cloudinary Images, SEO Engine, Dedicated Edit Page |  **Completed** |
| **Step 6** | **Brands Module** | Handled natively inside Product model (No separate entity needed) | ⏭️ **Skipped** |
| **Step 7** | **Products Module** | 135 Catalog Products, 250 Variations, Yoast SEO Preserved, Dedicated Edit Page |  **Completed** |
| **Storefront** | **Public Home Page** | Navbar, Jost typography, Wake & Bake Carousel, Delivery Steps, Best Sellers (🔥), New Arrivals (✨) |  **Completed** |
| **Step 8** | **Orders & Fulfillment** | Delivery & Pickup flows, COD Payment status, Status Transitions, Order Detail Drawer | ⏳ **Next Up** |
| **Step 9** | **Blog & Content Engine** | Rich Text Editor, Cover Images, Categories/Tags, Publishing workflow, SEO fields | 📋 Planned |
| **Step 10** | **SEO Management** | 301 Redirects Manager (from WP/WooCommerce), Global Meta, Sitemap generator | 📋 Planned |
| **Step 11** | **Deals, Coupons & Loyalty** | Promo codes, Flash sales, Loyalty points, VIP tiers & rewards tracking | 📋 Planned |
| **Step 12** | **Activity Log & Live Dashboard** | Audit logging (Who/What/When/IP), Real aggregation stats on Dashboard | 📋 Planned |

---

## 🔍 Detailed Specification of Remaining Steps

---

### ⏳ STEP 4: Customers Module (Read-Only Directory + Customer Detail)

#### Objective
Provide a unified view of registered customer profiles, their purchasing metrics, shipping/pickup preferences, and historical orders.

#### Data Models & Fields
- **Customer Schema (`Customer.ts` or `User.ts` with `role: "customer"`):**
  - `name`: String (Required)
  - `email`: String (Unique, Indexed)
  - `phone`: String (Required for delivery notifications)
  - `addresses`: Array of `{ street, city, state, zipCode, isDefault }` (DC Metro focus)
  - `totalOrders`: Number (Aggregated count)
  - `totalSpent`: Number (Aggregated COD spend)
  - `loyaltyPoints`: Number (Default 0)
  - `isVerified21Plus`: Boolean (Age verification flag for hemp/CBD compliance)
  - `notes`: String (Internal customer notes)
  - `wooId`: Optional unique ID (legacy WooCommerce migration)
  - `isDeleted`: Boolean (Soft delete)
  - `timestamps`: true

#### Backend APIs
- `GET /api/admin/customers`: Paginated customer directory with search (`name`, `email`, `phone`), sorting by spend/date. Requires `customers.view`.
- `GET /api/admin/customers/[id]`: Detailed profile with customer order history, address book, and loyalty balance. Requires `customers.view`.
- `PATCH /api/admin/customers/[id]`: Update customer notes and flags (`isVerified21Plus`). Requires `customers.manage`.

#### Frontend Components
- **`src/app/(admin)/admin/customers/page.tsx`:** Customer table with TanStack Table v8, search input, spend highlights, and action buttons.
- **`src/components/admin/customers/customer-detail-drawer.tsx`:** Slide-over sheet showing:
  - Header: Avatar, Name, Verification badge, Total Spent, Order Count.
  - Tab 1: Order History (Order ID, Fulfillment type, Total, Date, Status badge).
  - Tab 2: Saved Delivery Addresses.
  - Tab 3: Admin Notes & Compliance Verification.

---

### 📋 STEP 5: Categories Module (Hierarchy & SEO) [COMPLETED]

#### Objective
Structured hierarchy for cannabis products (e.g., *Flowers > Hybrid/Indica/Sativa*, *Disposables > 2G BOUTIQ Switch/LIT Sticks*, *Edibles*, *Cartridges*), integrated with Cloudinary image upload, automatic Cloudinary file deletion upon replacement/removal, full Google SERP SEO controls (meta title, description, focus keyword, canonical, robots index), and 1-click WooCommerce CSV category synchronization.

#### Data Models & Fields
- **Category Schema (`Category.ts`):**
  - `name`: String (Required, trimmed)
  - `slug`: String (Unique, indexed, URL-friendly)
  - `description`: String
  - `parentId`: ObjectId (Ref to `Category`, optional for parent-child tree)
  - `image`: `{ url: String, publicId: String, altText: String }`
  - `displayOrder`: Number (Display sorting order)
  - `isActive`: Boolean (Default true)
  - `wooId`: Mixed (Optional legacy ID)
  - `seo`: `{ metaTitle: String, metaDescription: String, focusKeyword: String, canonicalUrl: String, metaRobotsIndex: Boolean }`
  - `timestamps`: true

#### Backend APIs
- `GET /api/admin/categories`: Flat & nested category hierarchy. Requires `categories.view`.
- `POST /api/admin/categories`: Create category with slug generation. Requires `categories.create`.
- `PUT /api/admin/categories/[id]`: Update category and parent reference. Requires `categories.edit` (or `categories.seo` for SEO only).
- `DELETE /api/admin/categories/[id]`: Soft/safe delete (checks for existing subcategories/products). Requires `categories.delete`.

#### Frontend Components
- **`src/app/(admin)/admin/categories/page.tsx`:** Category table with parent badge, product count, and quick edit buttons.
- **`src/components/admin/categories/category-dialog.tsx`:** Form with parent selector, slug auto-generator, image placeholder, and SEO drawer.

---

### 📋 STEP 6: Brands Module [SKIPPED]

> *Note: Skipped as per user requirement — store uses in-house and partner product tiers directly within the Product model without a separate Brand catalog entity.*

---

### 📋 STEP 7: Products Module (Variants & SEO Indexing) [COMPLETED]

#### Objective
Full cannabis e-commerce catalog management with variable product weights/sizes, Cloudinary media gallery with automatic deletion, dedicated full edit pages, 100% Yoast SEO metadata preservation, and 1-click WooCommerce CSV product synchronization.

#### Data Models & Fields
- **Product Schema (`Product.ts`):**
  - `name`: String (Required)
  - `slug`: String (Unique, indexed)
  - `description`: String (Rich content)
  - `shortDescription`: String
  - `brandId`: ObjectId (Ref `Brand`)
  - `categories`: Array of ObjectId (Ref `Category`)
  - `strainType`: Enum (`"sativa"` | `"indica"` | `"hybrid"` | `"cbd"` | `"high-thc"`)
  - `thcMg`: Number (e.g., 25.5 mg or %)
  - `cbdMg`: Number (e.g., 100 mg)
  - `coaFileUrl`: String (Certificate of Analysis / Third-Party Lab Report URL)
  - `featured`: Boolean
  - `status`: Enum (`"draft"` | `"published"` | `"archived"`)
  - `hasVariants`: Boolean
  - `basePrice`: Number
  - `salePrice`: Number (Optional discount price)
  - `sku`: String (Unique)
  - `stockQuantity`: Number
  - `variants`: Array of:
    - `{ name: String, sku: String, sizeWeight: String, price: Number, salePrice: Number, stock: Number }`
  - `images`: Array of `{ url: String, alt: String, isPrimary: Boolean }`
  - `wooId`: Optional unique ID
  - `isDeleted`: Boolean
  - `seo`: `{ metaTitle: String, metaDescription: String, keywords: [String] }`
  - `timestamps`: true

#### Role Permission Enforcement Rule
- Users with `products.edit` can edit all product details.
- Users with only `products.seo` (e.g. SEO Specialist role) can ONLY update SEO fields; product prices, stock, and strains are locked/read-only.

#### Backend APIs
- `GET /api/admin/products`: Filterable by category, brand, strain, stock status. Requires `products.view`.
- `POST /api/admin/products`: Create product. Requires `products.create`.
- `PUT /api/admin/products/[id]`: Full or partial update. Requires `products.edit` or `products.seo`.
- `DELETE /api/admin/products/[id]`: Soft delete. Requires `products.delete`.

---

### 📋 STEP 8: Orders & Fulfillment (Delivery | Pickup)

#### Objective
Manage incoming orders with DC-specific delivery and store pickup queues, COD payment settlement, and status transitions.

#### Order Lifecycle Flows
- **Delivery Flow:**  
  `pending` ➔ `confirmed` ➔ `out_for_delivery` ➔ `delivered` (or `cancelled`)
- **Pickup Flow:**  
  `pending` ➔ `confirmed` ➔ `ready_for_pickup` ➔ `picked_up` (or `cancelled`)
- **Payment Settlement (COD Only):**  
  `paymentStatus`: `"unpaid"` ➔ `"collected"` (action available when delivering or picking up).

#### Data Models & Fields
- **Order Schema (`Order.ts`):**
  - `orderNumber`: String (Unique formatted e.g. `TRC-10492`)
  - `customer`: `{ name, email, phone }` or Ref to `Customer`
  - `fulfillmentType`: Enum (`"delivery"` | `"pickup"`)
  - `orderStatus`: String (Valid state machine per flow)
  - `paymentMethod`: `"cod"`
  - `paymentStatus`: Enum (`"unpaid"` | `"collected"`)
  - `items`: Array of `{ productId, variantId, name, quantity, price, total }`
  - `subtotal`: Number
  - `discount`: Number
  - `total`: Number
  - `deliveryAddress`: `{ street, apt, city, state, zipCode, deliveryInstructions }`
  - `statusHistory`: Array of `{ status, timestamp, updatedBy, note }`
  - `timestamps`: true

#### Frontend Components
- **`src/app/(admin)/admin/orders/page.tsx`:** Two prominent tabs: **"Local Delivery"** & **"Store Pickup"** with status filter chips and live count pills.
- **`src/components/admin/orders/order-detail-drawer.tsx`:** Detailed order drawer with customer contact, itemized receipt, status update button, and one-click **"Mark COD Paid"** action.

---

### 📋 STEP 9: Blogs & Content Engine

#### Objective
Content management for hemp education, Washington DC cannabis news, and organic SEO growth.

#### Data Models & Fields
- **Blog Schema (`Blog.ts`):**
  - `title`: String (Required)
  - `slug`: String (Unique, indexed)
  - `content`: String (HTML or markdown from rich editor)
  - `excerpt`: String
  - `coverImage`: String
  - `authorId`: ObjectId (Ref `User`)
  - `categories`: Array of String
  - `tags`: Array of String
  - `status`: Enum (`"draft"` | `"published"`)
  - `publishedAt`: Date
  - `seo`: `{ metaTitle, metaDescription, canonicalUrl }`
  - `timestamps`: true

#### Frontend Components
- Rich text editor integration, cover image preview, tags input, and direct publish toggle (gated by `blogs.publish`).

---

### 📋 STEP 10: SEO Management Module

#### Objective
Manage WordPress/WooCommerce 301 legacy redirects, configure global store OpenGraph & meta headers, and trigger sitemap refreshes.

#### Features
1. **Redirects Manager (`Redirect.ts`):**
   - Fields: `sourcePath`, `destinationPath`, `statusCode` (301 permanent / 302 temporary), `hitCount`, `isActive`.
   - Middleware handles instant redirect resolution.
2. **Global Meta Settings (`SeoSetting.ts`):**
   - Title template, default description, OpenGraph default banner, Twitter cards, robots configuration.
3. **Sitemap Controls:**
   - Visual sitemap status: dynamically lists active products, categories, blogs, and public pages.

---

### 📋 STEP 11: Deals, Coupons & Loyalty Program

#### Deals & Coupons (`Coupon.ts`)
- `code`: String (Unique, uppercase, e.g. `TORCH420`)
- `discountType`: Enum (`"percentage"` | `"fixed_amount"`)
- `discountValue`: Number
- `minimumSpend`: Number
- `usageLimit`: Number
- `usageCount`: Number
- `startDate`, `endDate`: Dates
- `isActive`: Boolean

#### Loyalty Rewards (`LoyaltySetting.ts` & Customer Points Ledger)
- Points per dollar spent (e.g. 1 point = $1 COD order).
- Redemption value rules.
- VIP Tier definitions: Bronze, Silver, Gold with bonus point multipliers.

---

### 📋 STEP 12: Activity Log & Live Analytics Dashboard

#### Activity Log (`ActivityLog.ts`)
- Automated audit trail recording who performed every mutation:
  - `userId`: ObjectId (Ref `User`)
  - `userName`: String
  - `action`: String (e.g., `"product.created"`, `"order.status_updated"`, `"role.permissions_changed"`)
  - `entity`: String (`"Order"`, `"Product"`, `"Staff"`, `"Role"`)
  - `entityId`: String
  - `details`: Object (Previous values vs new values)
  - `ipAddress`: String
  - `timestamps`: true

#### Live Dashboard Metrics
- MongoDB aggregate pipelines computing real revenue from `orders` (`paymentStatus === "collected"`).
- Real counts of pending deliveries, store pickups, low stock alerts, and top selling products.

---

## 🔒 Code Standards & Quality Guidelines

- **Strict TypeScript:** No `any`. All schemas strongly typed with Zod inferences.
- **Error Handling:** Standardized API shape `{ success: boolean, data?: T, error?: string }`.
- **Feedback:** All asynchronous mutations wrapped with `react-hot-toast` (`toast.promise`).
- **Access Control:** 3-tier enforcement (Proxy -> Server `requirePermission` -> Client `<Can />` / `PermissionGuard`).
- **Brand Consistency:** Strictly **TORCH** branding, `#5A805B` green accents, dark/light theme support.
