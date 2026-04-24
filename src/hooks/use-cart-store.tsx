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
  isFree?: boolean;
}

export type AddableItem = Omit<Item, "quantity" | "itemId">;

export interface Discount {
  id: string;
  name: string;
  appliesTo: string[];
  type: string;
  value: bigint;
}

interface CartState {
  items: Item[];
  totalPrice: number;
  discountId: string | null;
  discount: Discount | null;
  rewardId: string | null;
  addItem: (item: AddableItem) => void;
  updateItemCustomization: (itemId: string, item: AddableItem) => void;
  addOneToItem: (itemId: string) => void;
  removeOneFromItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setDiscount: (discount: Discount, rewardId: string) => void;
  clearDiscount: () => void;
  addFreeItem: (itemId: AddableItem) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  totalPrice: 0,
  discountId: null,
  discount: null,
  rewardId: null,

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

  removeItem: (itemId) => {
    const itemToRemove = get().items.find((item) => item.itemId === itemId);
    set((state) => ({
      items: state.items.filter((item) => item.itemId !== itemId),
      ...(itemToRemove?.isFree && {
        discount: null,
        discountId: null,
        rewardId: null,
      }),
    }));
  },

  clearCart: () =>
    set({
      items: [],
      totalPrice: 0,
      discountId: null,
      discount: null,
      rewardId: null,
    }),

  setDiscount: (discount, rewardId) =>
    set({
      discount,
      discountId: discount.id,
      rewardId,
    }),

  clearDiscount: () =>
    set((state) => ({
      discount: null,
      discountId: null,
      rewardId: null,
      items: state.items.filter((item) => !item.isFree),
    })),

  addFreeItem: (item) => {
    set((state) => ({
      items: [
        ...state.items,
        {
          ...item,
          quantity: 1,
          itemId: `${item.variantId}-${Date.now()}`,
          isFree: true,
        },
      ],
    }));
  },
}));
