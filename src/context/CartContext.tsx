import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "@/components/ui/sonner";

// Product type
export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  type: "veg" | "non-veg";
  description: string;
  ingredients?: string;
  pricePerWeight: {
    [weight: string]: number; // e.g., "250": 199
  };
}

// Cart item type
interface CartItem {
  product: Product;
  weight: string; // selected variant like "250", "500", "1000"
  quantity: number;
}

// Context shape
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, weight: string, quantity?: number) => void;
  removeItem: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  updateItemQuantity: (productId: string, quantity: number) => void;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Add item
  const addItem = (product: Product, weight: string, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id && item.weight === weight
      );

      if (existingItem) {
        toast.success(`Updated ${product.name} (${weight}g) quantity in cart`);
        return prevItems.map((item) =>
          item.product.id === product.id && item.weight === weight
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      toast.success(`Added ${product.name} (${weight}g) to cart`);
      return [...prevItems, { product, weight, quantity }];
    });
  };

  // Remove item
  const removeItem = (productId: string, weight: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find(
        (item) => item.product.id === productId && item.weight === weight
      );
      if (itemToRemove) {
        toast.info(`Removed ${itemToRemove.product.name} (${weight}g) from cart`);
      }
      return prevItems.filter(
        (item) => !(item.product.id === productId && item.weight === weight)
      );
    });
  };

  // Update quantity
  const updateQuantity = (productId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, weight);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && item.weight === weight
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Update item quantity
  const updateItemQuantity = (productId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    toast.info("Cart cleared");
  };

  // Total quantity of items
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Total price based on selected weight
  const total = items.reduce((sum, item) => {
    const priceForWeight = item.product.pricePerWeight[item.weight] || 0;
    return sum + priceForWeight * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
        updateItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook for consuming cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
