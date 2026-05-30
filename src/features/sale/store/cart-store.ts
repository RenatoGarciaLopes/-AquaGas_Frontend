"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { SaleProduct, SaleCustomer } from "@/features/sale/types";

export type CartItem = {
  product: SaleProduct;
  quantity: number;
};

type CartState = {
  customer: SaleCustomer | null;
  discount: number;
  items: CartItem[];
  addProduct: (product: SaleProduct) => void;
  clear: () => void;
  removeItem: (productId: string) => void;
  setCustomer: (customer: SaleCustomer | null) => void;
  setDiscount: (discount: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  reconcileProducts: (products: SaleProduct[]) => void;
};

function clampQuantity(quantity: number, stock: number) {
  return Math.min(Math.max(1, quantity), Math.max(1, stock));
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      customer: null,
      discount: 0,
      items: [],
      addProduct: (product) =>
        set((state) => {
          if (product.quantity <= 0) return state;
          const current = state.items.find((i) => i.product.id === product.id);
          if (!current) {
            return { items: [...state.items, { product, quantity: 1 }] };
          }

          return {
            items: state.items.map((item) =>
              item.product.id === product.id
                ? {
                    ...item,
                    product,
                    quantity: clampQuantity(
                      item.quantity + 1,
                      product.quantity,
                    ),
                  }
                : item,
            ),
          };
        }),
      clear: () => set({ customer: null, discount: 0, items: [] }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),
      setCustomer: (customer) => set({ customer }),
      setDiscount: (discount) =>
        set({ discount: Math.min(Math.max(discount, 0), 100) }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: clampQuantity(quantity, item.product.quantity),
                }
              : item,
          ),
        })),
      reconcileProducts: (products) =>
        set((state) => {
          const byId = new Map(
            products.map((product) => [product.id, product]),
          );
          return {
            items: state.items
              .map((item) => {
                const product = byId.get(item.product.id);
                if (!product || product.quantity <= 0) return null;
                return {
                  product,
                  quantity: clampQuantity(item.quantity, product.quantity),
                };
              })
              .filter((item): item is CartItem => item !== null),
          };
        }),
    }),
    {
      name: "aquagas-sale-cart",
      partialize: (state) => ({
        customer: state.customer,
        discount: state.discount,
        items: state.items,
      }),
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
