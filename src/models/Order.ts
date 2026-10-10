import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
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

export interface IOrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface IOrderDeliveryAddress {
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: IOrderCustomer;
  fulfillment: "delivery" | "pickup";
  deliveryAddress?: IOrderDeliveryAddress;
  deliveryNotes?: string;
  pickupLocation?: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  couponCode?: string;
  discountAmount?: number;
  total: number;
  paymentMethod: "cash_on_delivery" | "cash_on_pickup";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "out_for_delivery"
    | "ready_for_pickup"
    | "completed"
    | "cancelled";
  isAgeVerified: boolean;
  idPhotoUrl?: string;
  sessionId?: string;
  userId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
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

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    fulfillment: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },
    deliveryAddress: {
      street: { type: String, default: "" },
      apartment: { type: String, default: "" },
      city: { type: String, default: "Washington" },
      state: { type: String, default: "DC" },
      zip: { type: String, default: "" },
    },
    deliveryNotes: {
      type: String,
      default: "",
    },
    pickupLocation: {
      type: String,
      default: "1025 F St NW, Washington, DC",
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "cash_on_pickup"],
      default: "cash_on_delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "out_for_delivery",
        "ready_for_pickup",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    isAgeVerified: {
      type: Boolean,
      default: true,
    },
    idPhotoUrl: {
      type: String,
      default: "",
    },
    sessionId: {
      type: String,
      default: "",
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "customer.email": 1 });
OrderSchema.index({ "customer.phone": 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
