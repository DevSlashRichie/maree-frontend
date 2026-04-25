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
  isDiscounted?: boolean;
  discountAmountCents?: number;
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
  pendingDiscount: { discount: Discount; rewardId: string } | null;
  addItem: (item: AddableItem) => void;
  updateItemCustomization: (itemId: string, item: AddableItem) => void;
  addOneToItem: (itemId: string) => void;
  removeOneFromItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setDiscount: (discount: Discount, rewardId: string) => void;
  setPendingDiscount: (discount: Discount, rewardId: string) => void;
  applyDiscountToItem: (itemId: string, discountAmountCents: number) => void;
  clearDiscount: () => void;
  addDiscountedItem: (item: AddableItem, discountAmountCents: number) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  totalPrice: 0,
  discountId: null,
  discount: null,
  rewardId: null,
  pendingDiscount: null,

  addItem: (item) => {
    const state = get();
    const newItemId = `${item.variantId}-${Date.now()}`;

    // If there's a pending discount, apply it to the first item added
    if (state.pendingDiscount) {
      const { discount, rewardId } = state.pendingDiscount;

      // Calculate discount amount
      let discountAmountCents = 0;
      if (discount.type === "percentage") {
        discountAmountCents = Math.floor(
          ((item.unitPriceCents ?? 0) * Number(discount.value)) / 10000
        );
      } else {
        discountAmountCents = Number(discount.value);
      }

      set({
        items: [
          ...state.items,
          {
            ...item,
            quantity: 1,
            itemId: newItemId,
            isDiscounted: true,
            discountAmountCents,
          },
        ],
        discountId: discount.id,
        discount,
        rewardId,
        pendingDiscount: null,
      });
    } else {
      set({
        items: [
          ...state.items,
          {
            ...item,
            quantity: 1,
            itemId: newItemId,
          },
        ],
      });
    }
  },

  // ...existing code...

  addOneToItem: (itemId) =>
    set({
      items: get().items.map((item) =>
        item.itemId === itemId && !item.isDiscounted
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    }),

  removeOneFromItem: (itemId) =>
    set({
      items: get().items.map((item) =>
        item.itemId === itemId && !item.isDiscounted
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    }),

  removeItem: (itemId) => {
    const itemToRemove = get().items.find((item) => item.itemId === itemId);
    set((state) => ({
      items: state.items.filter((item) => item.itemId !== itemId),
      ...(itemToRemove?.isDiscounted && {
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
      pendingDiscount: null,
    }),

  setDiscount: (discount, rewardId) =>
    set({
      discount,
      discountId: discount.id,
      rewardId,
    }),

  setPendingDiscount: (discount, rewardId) =>
    set({
      pendingDiscount: { discount, rewardId },
    }),

  applyDiscountToItem: (itemId, discountAmountCents) =>
    set({
      items: get().items.map((item) =>
        item.itemId === itemId
          ? { ...item, isDiscounted: true, discountAmountCents }
          : item,
      ),
    }),

  clearDiscount: () =>
    set((state) => ({
      discount: null,
      discountId: null,
      rewardId: null,
      pendingDiscount: null,
      items: state.items.map((item) =>
        item.isDiscounted
          ? { ...item, isDiscounted: false, discountAmountCents: undefined }
          : item,
      ),
    })),

  addDiscountedItem: (item, discountAmountCents) => {
    set((state) => ({
      items: [
        ...state.items,
        {
          ...item,
          quantity: 1,
          itemId: `${item.variantId}-${Date.now()}`,
          isDiscounted: true,
          discountAmountCents,
        },
      ],
    }));
  },

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
}));
