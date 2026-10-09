import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  weight?: string;
  tier?: string;
  category?: string;
  quantity: number;
}

export interface ICartCustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
}

export interface ICart extends Document {
  sessionId: string;
  userId?: mongoose.Types.ObjectId | null;
  items: ICartItem[];
  fulfillment: "delivery" | "pickup";
  deliveryZip?: string;
  subtotal: number;
  totalCount: number;
  customerInfo?: ICartCustomerInfo;
  status: "active" | "abandoned" | "converted";
  convertedOrderId?: mongoose.Types.ObjectId | null;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    weight: { type: String, default: "" },
    tier: { type: String, default: "" },
    category: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const CartCustomerInfoSchema = new Schema<ICartCustomerInfo>(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    zip: { type: String, default: "" },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    fulfillment: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },
    deliveryZip: {
      type: String,
      default: "20004",
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    customerInfo: {
      type: CartCustomerInfoSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ["active", "abandoned", "converted"],
      default: "active",
      index: true,
    },
    convertedOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-index sessionId and userId for fast lookups
CartSchema.index({ sessionId: 1, status: 1 });
CartSchema.index({ userId: 1, status: 1 });
CartSchema.index({ status: 1, lastActiveAt: -1 });

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
