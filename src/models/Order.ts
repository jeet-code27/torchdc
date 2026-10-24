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
  email?: string;
  phone: string;
}

export interface IOrderDeliveryAddress {
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface IOrderHistoryEntry {
  at: Date;
  label: string;
  status?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: IOrderCustomer;
  fulfillment: "delivery" | "pickup";
  deliveryAddress?: IOrderDeliveryAddress;
  deliveryNotes?: string;
  changeFor?: string;
  firstOrder?: boolean;
  prerollBonus?: boolean;
  dealsBreakdown?: Array<{ label: string; amount: number }>;
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
  /** Internal note from staff (never shown to the customer) */
  staffNotes?: string;
  /** Status changes, newest last: "Confirmed by Torch Admin" */
  history?: IOrderHistoryEntry[];
  /** Test orders are left out of the admin lists and every total */
  isTest?: boolean;
  completedAt?: Date | null;
  /** Set once the "still waiting" push reminder went out */
  alertReminderSentAt?: Date;
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
      email: { type: String, default: "", trim: true, lowercase: true },
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
    changeFor: {
      type: String,
      default: "",
    },
    firstOrder: {
      type: Boolean,
      default: false,
    },
    prerollBonus: {
      type: Boolean,
      default: false,
    },
    dealsBreakdown: [
      {
        label: { type: String, default: "" },
        amount: { type: Number, default: 0 },
      },
    ],
    pickupLocation: {
      type: String,
      default: "1000 G St NW, Washington, DC",
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
    staffNotes: {
      type: String,
      default: "",
    },
    history: [
      {
        _id: false,
        at: { type: Date, default: Date.now },
        label: { type: String, required: true },
        status: { type: String },
      },
    ],
    isTest: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    alertReminderSentAt: {
      type: Date,
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
