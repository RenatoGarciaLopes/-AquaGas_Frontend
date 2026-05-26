import { beforeEach, describe, expect, it } from "vitest";

import { useCartStore } from "@/features/sale/store/cart-store";

const WATER = {
  id: "p1",
  name: "Água 20L",
  price: 12,
  quantity: 2,
  type: "Water" as const,
};

const GAS = {
  id: "p2",
  name: "Gás 13kg",
  price: 115,
  quantity: 0,
  type: "Gas" as const,
};

describe("useCartStore", () => {
  beforeEach(() => {
    sessionStorage.clear();
    useCartStore.getState().clear();
  });

  it("adiciona produto com estoque e ignora produto sem estoque", () => {
    useCartStore.getState().addProduct(WATER);
    useCartStore.getState().addProduct(GAS);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]).toMatchObject({
      product: WATER,
      quantity: 1,
    });
  });

  it("incrementa até o limite de estoque", () => {
    useCartStore.getState().addProduct(WATER);
    useCartStore.getState().addProduct(WATER);
    useCartStore.getState().addProduct(WATER);

    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it("limita quantity e discount por faixa válida", () => {
    useCartStore.getState().addProduct(WATER);
    useCartStore.getState().setQuantity("p1", 99);
    useCartStore.getState().setDiscount(150);

    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
    expect(useCartStore.getState().discount).toBe(100);

    useCartStore.getState().setDiscount(-10);
    expect(useCartStore.getState().discount).toBe(0);
  });

  it("reconcilia produtos removendo indisponíveis e atualizando estoque", () => {
    useCartStore.getState().addProduct(WATER);
    useCartStore.getState().setQuantity("p1", 2);

    useCartStore
      .getState()
      .reconcileProducts([{ ...WATER, price: 13, quantity: 1 }, GAS]);

    expect(useCartStore.getState().items).toEqual([
      { product: { ...WATER, price: 13, quantity: 1 }, quantity: 1 },
    ]);
  });
});
