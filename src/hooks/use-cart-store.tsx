import { create } from "zustand";

export interface Modifier {
  id: string;
  delta: number;
}

export interface Item {
  itemId: string;
  variantId: string;
  quantity: number;
  itemNotes: string;
  modifiers: Modifier[];
  displayName?: string;
  displayImage?: string;
  unitPriceCents?: number;
}

export type AddableItem = Omit<Item, "quantity" | "itemId">;

interface CartState {
  items: Item[];
  totalPrice: number;
  discountId: string;
  addItem: (item: AddableItem) => void;
  updateItemCustomization: (itemId: string, item: AddableItem) => void;
  addOneToItem: (itemId: string) => void;
  removeOneFromItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  totalPrice: 0,
  discountId: "",

  addItem: (item) =>
    set({
      items: [
        ...get().items,
        {
          ...item,
          quantity: 1,
          itemId: `${item.variantId}-${Date.now()}`,
        },
      ],
    }),

  updateItemCustomization: (itemId, nextItem) =>
    set({
      items: get().items.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              ...nextItem,
              itemId: item.itemId,
              quantity: item.quantity,
            }
          : item,
      ),
    }),

  addOneToItem: (itemId) =>
    set({
      items: get().items.map((item) =>
        item.itemId === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    }),

  removeOneFromItem: (itemId) =>
    set({
      items: get().items.map((item) =>
        item.itemId === itemId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    }),

  removeItem: (itemId) =>
    set({
      items: get().items.filter((item) => item.itemId !== itemId),
    }),

  clearCart: () =>
    set({
      items: [],
      totalPrice: 0,
    }),
}));
