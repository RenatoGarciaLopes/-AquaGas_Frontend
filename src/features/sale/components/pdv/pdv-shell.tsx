"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { useRegisterSale } from "@/features/sale/hooks/use-register-sale";

import { Icons } from "@/shared/lib/icons";

import { ApiError } from "@/shared/api/errors";
import type { UserRole } from "@/shared/auth/roles";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";

import { useCartStore } from "@/features/sale/store/cart-store";
import { calculateSaleTotals } from "@/features/sale/lib/totals";
import { PdvCart } from "@/features/sale/components/pdv/pdv-cart";
import { PdvTotals } from "@/features/sale/components/pdv/pdv-totals";
import type { SaleProduct, SaleCustomer } from "@/features/sale/types";
import { PdvProductSearch } from "@/features/sale/components/pdv/pdv-product-search";
import { ConfirmSaleDialog } from "@/features/sale/components/pdv/confirm-sale-dialog";
import { PdvCustomerPicker } from "@/features/sale/components/pdv/pdv-customer-picker";
import { PdvDiscountControl } from "@/features/sale/components/pdv/pdv-discount-control";

type PdvShellProps = {
  initialCustomers: SaleCustomer[];
  initialProducts: SaleProduct[];
  role: UserRole | null;
};

function saleErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "Não foi possível finalizar a venda.";
  }
  if (error.code === "INSUFFICIENT_STOCK") return error.message;
  if (error.status === 403) return "Apenas gerentes podem aplicar desconto.";
  if (error.status >= 500) return "Erro interno. Tente novamente.";
  return error.message;
}

export function PdvShell({
  initialCustomers,
  initialProducts,
  role,
}: PdvShellProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const registerSale = useRegisterSale();

  const {
    addProduct,
    clear,
    customer,
    discount,
    items,
    reconcileProducts,
    removeItem,
    setCustomer,
    setDiscount,
    setQuantity,
  } = useCartStore();

  useEffect(() => {
    reconcileProducts(initialProducts);
  }, [initialProducts, reconcileProducts]);

  useEffect(() => {
    if (role !== "GERENTE" && discount !== 0) setDiscount(0);
  }, [discount, role, setDiscount]);

  const totals = useMemo(
    () => calculateSaleTotals(items, role === "GERENTE" ? discount : 0),
    [discount, items, role],
  );

  const canSubmit = items.length > 0 && !registerSale.isPending;

  async function handleConfirm() {
    try {
      const sale = await registerSale.mutateAsync({
        customerId: customer?.id ?? null,
        discount:
          role === "GERENTE" && totals.discount > 0 ? totals.discount : null,
        saleItems: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
      clear();
      toast.success("Venda finalizada com sucesso.");
      router.push(`/sales/${sale.id}`);
    } catch (error) {
      toast.error(saleErrorMessage(error));
      setConfirmOpen(false);
    }
  }

  if (initialProducts.length === 0) {
    return (
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Nova venda"
          description="Registre vendas avulsas com baixa imediata de estoque."
        />
        <ErrorState
          title="Nenhum produto disponível"
          description="Cadastre produtos com estoque antes de iniciar uma venda."
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Nova venda"
        description="Registre uma venda avulsa de balcão com baixa imediata de estoque."
        actions={
          <Link
            href="/sales"
            className="border-border text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
          >
            <Icon icon={Icons.chevronLeft} aria-hidden className="h-4 w-4" />
            Vendas
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <PdvProductSearch products={initialProducts} onSelect={addProduct} />
          <PdvCart
            items={items}
            onQuantityChange={setQuantity}
            onRemove={removeItem}
          />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <PdvCustomerPicker
            customers={initialCustomers}
            selected={customer}
            onSelect={setCustomer}
          />
          <PdvDiscountControl
            discount={totals.discount}
            role={role}
            onChange={setDiscount}
          />
          <PdvTotals
            discount={totals.discount}
            discountValue={totals.discountValue}
            itemCount={items.length}
            subtotal={totals.subtotal}
            total={totals.total}
          />
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => setConfirmOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon icon={Icons.check} aria-hidden className="h-5 w-5" />
            {registerSale.isPending ? "Finalizando..." : "Finalizar venda"}
          </button>
        </aside>
      </div>

      <ConfirmSaleDialog
        open={confirmOpen}
        customer={customer}
        discount={totals.discount}
        items={items}
        pending={registerSale.isPending}
        total={totals.total}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </main>
  );
}
