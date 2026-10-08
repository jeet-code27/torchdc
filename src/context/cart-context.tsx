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

interface CartContextType {
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
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "torch_cart_items";
const FULFILLMENT_STORAGE_KEY = "torch_fulfillment_mode";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [fulfillment, setFulfillmentState] = React.useState<FulfillmentType>("delivery");
  const [deliveryZip, setDeliveryZip] = React.useState("20004");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
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
  }, []);

  const totalCount = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
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
