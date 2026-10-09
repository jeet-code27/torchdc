"use client";

import * as React from "react";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  weight?: string;
  tier?: string;
  category?: string;
  quantity: number;
}

export type FulfillmentType = "delivery" | "pickup";

export interface CartCustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
}

interface CartContextType {
  sessionId: string;
  items: CartItem[];
  fulfillment: FulfillmentType;
  deliveryZip: string;
  totalCount: number;
  subtotal: number;
  isCartDrawerOpen: boolean;
  setFulfillment: (mode: FulfillmentType) => void;
  setDeliveryZip: (zip: string) => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, weight?: string) => void;
  updateQuantity: (id: string, quantity: number, weight?: string) => void;
  clearCart: () => void;
  syncCustomerInfo: (info: CartCustomerInfo) => void;
  mergeSessionCart: () => Promise<void>;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "torch_cart_items";
const FULFILLMENT_STORAGE_KEY = "torch_fulfillment_mode";
const SESSION_STORAGE_KEY = "torch_session_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid =
        "torch_sess_" +
        Math.random().toString(36).substring(2, 9) +
        "_" +
        Date.now().toString(36);
      localStorage.setItem(SESSION_STORAGE_KEY, sid);
      document.cookie = `torch_session_id=${sid}; path=/; max-age=2592000; SameSite=Lax`;
    }
    return sid;
  } catch {
    return "torch_sess_fallback";
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = React.useState<string>("");
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [fulfillment, setFulfillmentState] = React.useState<FulfillmentType>("delivery");
  const [deliveryZip, setDeliveryZip] = React.useState("20004");
  const [customerInfo, setCustomerInfo] = React.useState<CartCustomerInfo>({});
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize session ID and load from localStorage
  React.useEffect(() => {
    try {
      const sid = getOrCreateSessionId();
      setSessionId(sid);

      const storedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
      const storedFulfillment = localStorage.getItem(FULFILLMENT_STORAGE_KEY);
      if (storedFulfillment === "delivery" || storedFulfillment === "pickup") {
        setFulfillmentState(storedFulfillment);
      }
    } catch (e) {
      console.warn("Could not load cart from storage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save items to localStorage whenever they change
  React.useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save cart to storage", e);
    }
  }, [items, isInitialized]);

  // Real-time Background Sync to MongoDB via /api/cart/sync (Debounced)
  React.useEffect(() => {
    if (!isInitialized || !sessionId) return;

    const handler = setTimeout(async () => {
      try {
        const computedSubtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const computedTotalCount = items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            items,
            fulfillment,
            deliveryZip,
            subtotal: computedSubtotal,
            totalCount: computedTotalCount,
            customerInfo,
          }),
        });
      } catch (err) {
        console.warn("Background cart sync failed:", err);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [items, fulfillment, deliveryZip, customerInfo, sessionId, isInitialized]);

  // Set fulfillment mode and persist
  const setFulfillment = React.useCallback((mode: FulfillmentType) => {
    setFulfillmentState(mode);
    try {
      localStorage.setItem(FULFILLMENT_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const addItem = React.useCallback(
    (product: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const itemIndex = prev.findIndex(
          (item) => item.id === product.id && item.weight === product.weight
        );

        if (itemIndex > -1) {
          const updated = [...prev];
          updated[itemIndex] = {
            ...updated[itemIndex],
            quantity: updated[itemIndex].quantity + quantity,
          };
          return updated;
        }

        return [...prev, { ...product, quantity }];
      });
    },
    []
  );

  const removeItem = React.useCallback((id: string, weight?: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.weight === weight))
    );
  }, []);

  const updateQuantity = React.useCallback(
    (id: string, quantity: number, weight?: string) => {
      if (quantity <= 0) {
        removeItem(id, weight);
        return;
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id && item.weight === weight) {
            return { ...item, quantity };
          }
          return item;
        })
      );
    },
    [removeItem]
  );

  const clearCart = React.useCallback(() => {
    setItems([]);
    if (sessionId) {
      fetch(`/api/cart/sync?sessionId=${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      }).catch(() => null);
    }
  }, [sessionId]);

  // Live customer info sync (captures email/phone/address during checkout for abandoned cart tracking)
  const syncCustomerInfo = React.useCallback((info: CartCustomerInfo) => {
    setCustomerInfo((prev) => ({ ...prev, ...info }));
  }, []);

  // Merge guest session cart when user logs in
  const mergeSessionCart = React.useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success && data.cart?.items) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const merged: CartItem[] = data.cart.items.map((it: any) => ({
          id: it.productId,
          name: it.name,
          slug: it.slug,
          price: it.price,
          image: it.image,
          weight: it.weight,
          tier: it.tier,
          category: it.category,
          quantity: it.quantity,
        }));
        setItems(merged);
      }
    } catch (e) {
      console.warn("Failed to merge cart on login:", e);
    }
  }, [sessionId]);

  const totalCount = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        sessionId,
        items,
        fulfillment,
        deliveryZip,
        totalCount,
        subtotal,
        isCartDrawerOpen,
        setFulfillment,
        setDeliveryZip,
        setIsCartDrawerOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        syncCustomerInfo,
        mergeSessionCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
