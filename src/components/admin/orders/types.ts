/** Shape the new admin components expect. Mirrors the existing /api/admin/orders response. */

export type OrderStatus = 'pending' | 'confirmed' | 'out_for_delivery' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type AdminOrderItem = {
  name: string;
  quantity: number;
  price: number;
  weight?: string;
  category?: string;
};

export type AdminOrderHistoryEntry = {
  at: string; // ISO date
  label: string; // e.g. "Confirmed by Torch Admin"
};

export type AdminOrder = {
  _id: string;
  orderNumber: string; // "#1042" (new) or "TORCH-806546" (old orders keep their number)
  customer: { name: string; phone?: string; email?: string };
  fulfillment: 'delivery' | 'pickup';
  deliveryAddress?: { street?: string; apartment?: string; city?: string; state?: string; zip?: string };
  deliveryNotes?: string; // customer's note at checkout
  changeFor?: string; // "30" = customer needs change for $30
  staffNotes?: string;
  items: AdminOrderItem[];
  subtotal?: number;
  discountAmount?: number; // flower deals + coupon
  deliveryFee?: number;
  couponCode?: string;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  isAgeVerified?: boolean;
  isTest?: boolean;
  createdAt: string; // ISO date
  history?: AdminOrderHistoryEntry[];
};

/** Persist a status change for one or more orders. Must resolve only after the server saved it. */
export type SetOrderStatus = (orderIds: string[], status: OrderStatus) => Promise<void>;
