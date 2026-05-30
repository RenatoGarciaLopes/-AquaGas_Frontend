"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useSearchParams } from "next/navigation";
import { useRef, useState, useCallback } from "react";

import { Icons } from "@/shared/lib/icons";

import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { SettingsShell } from "@/shared/layouts/settings-shell";

import type { ProductResponse } from "@/features/product/types";
import { StockAdjustmentSection } from "@/features/product/components/stock-adjustment-section";
import { EditProductDetailsSection } from "@/features/product/components/edit-product-details-section";

type TabId = "details" | "stock";
type PendingAction = { type: "tab"; tab: TabId } | { type: "to-index" };

const TABS = [
  { id: "details", label: "Dados do produto", icon: Icons.package },
  { id: "stock", label: "Estoque", icon: Icons.shoppingCart },
] as const;

type Props = {
  product: ProductResponse;
};

function resolveInitialTab(value: string | null): TabId {
  return value === "stock" ? "stock" : "details";
}

export function EditProductForm({ product }: Props) {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    resolveInitialTab(initialTabParam),
  );
  const [mobileIndexOpen, setMobileIndexOpen] = useState<boolean>(
    () => initialTabParam === null,
  );
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  // Rastreia isDirty de cada aba independentemente — usado para alertar
  // antes de trocar de aba quando há alterações não salvas.
  const dirtyRef = useRef<Record<TabId, boolean>>({
    details: false,
    stock: false,
  });

  const handleDetailsDirty = useCallback((dirty: boolean) => {
    dirtyRef.current.details = dirty;
  }, []);

  const handleStockDirty = useCallback((dirty: boolean) => {
    dirtyRef.current.stock = dirty;
  }, []);

  function handleTabChange(next: string) {
    const nextTab = next as TabId;
    if (mobileIndexOpen) setMobileIndexOpen(false);
    if (nextTab === activeTab) return;

    if (dirtyRef.current[activeTab]) {
      setPendingAction({ tab: nextTab, type: "tab" });
      return;
    }

    setActiveTab(nextTab);
  }

  function handleBackToIndex() {
    if (dirtyRef.current[activeTab]) {
      setPendingAction({ type: "to-index" });
      return;
    }
    setMobileIndexOpen(true);
  }

  function confirmDiscard() {
    if (pendingAction?.type === "tab") {
      dirtyRef.current[activeTab] = false;
      setActiveTab(pendingAction.tab);
      setPendingAction(null);
      return;
    }
    if (pendingAction?.type === "to-index") {
      dirtyRef.current[activeTab] = false;
      setMobileIndexOpen(true);
      setPendingAction(null);
    }
  }

  function cancelDiscard() {
    setPendingAction(null);
  }

  return (
    <>
      <SettingsShell
        ariaLabel="Seções de edição do produto"
        tabs={[...TABS]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        mobileIndex={{
          showIndex: mobileIndexOpen,
          onBackToIndex: handleBackToIndex,
          heading: "O que deseja editar?",
          description: product.name,
        }}
        back={
          <Link
            href="/products"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
          >
            <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
            Voltar para produtos
          </Link>
        }
      >
        {activeTab === "details" ? (
          <EditProductDetailsSection
            key={`details-${product.id}`}
            product={product}
            onDirtyChange={handleDetailsDirty}
          />
        ) : null}
        {activeTab === "stock" ? (
          <StockAdjustmentSection
            key={`stock-${product.id}-${product.quantity}`}
            product={product}
            onDirtyChange={handleStockDirty}
          />
        ) : null}
      </SettingsShell>

      <ConfirmDialog
        open={pendingAction !== null}
        variant="danger"
        title="Descartar alterações?"
        description="Você tem alterações não salvas nesta seção. Se continuar, elas serão perdidas."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
  );
}
