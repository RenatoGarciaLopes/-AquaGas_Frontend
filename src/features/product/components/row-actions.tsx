"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

import { Icons } from "@/shared/lib/icons";

import { ApiError } from "@/shared/api/errors";
import { apiDelete } from "@/shared/api/client";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import type { ProductResponse } from "@/features/product/types";

type RowActionsProps = {
  canManage: boolean;
  product: ProductResponse;
};

type MenuPosition = { top: number; right: number };

export function RowActions({ canManage, product }: RowActionsProps) {
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { id, name } = product;

  function openMenu() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      right: window.innerWidth - rect.right,
    });
  }

  function closeMenu() {
    setMenuPos(null);
  }

  useEffect(() => {
    if (!menuPos) return;

    function onPointerDown(e: PointerEvent) {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        closeMenu();
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuPos]);

  function requestDeactivate() {
    closeMenu();
    setConfirmOpen(true);
  }

  async function confirmDeactivate() {
    setConfirmOpen(false);
    setIsDeactivating(true);
    try {
      await apiDelete(`/api/products/${id}`);
      toast.success(`${name} foi desativado com sucesso.`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        toast.error("Sem permissão para desativar produtos.");
        return;
      }
      if (error instanceof ApiError && error.status === 401) return;
      toast.error("Não foi possível desativar o produto.");
    } finally {
      setIsDeactivating(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Ações de ${name}`}
        aria-expanded={menuPos !== null}
        aria-haspopup="menu"
        onClick={() => (menuPos ? closeMenu() : openMenu())}
        className="border-border text-muted-foreground hover:bg-muted focus:ring-ring/40 inline-flex cursor-pointer items-center rounded-lg border p-2 transition focus:ring-2 focus:outline-none"
      >
        <Icon icon={Icons.moreHorizontal} aria-hidden className="h-4 w-4" />
      </button>

      {menuPos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: menuPos.top, right: menuPos.right }}
            className="border-border bg-card fixed z-50 min-w-44 overflow-hidden rounded-xl border py-1 shadow-lg shadow-black/10"
          >
            <Link
              href={`/products/${id}`}
              role="menuitem"
              onClick={closeMenu}
              className="text-foreground hover:bg-muted flex items-center gap-2.5 px-3 py-2 text-sm transition"
            >
              <Icon
                icon={Icons.eye}
                className="text-muted-foreground h-4 w-4 shrink-0"
              />
              Ver
            </Link>
            {canManage ? (
              <>
                <Link
                  href={`/products/${id}/edit`}
                  role="menuitem"
                  onClick={closeMenu}
                  className="text-foreground hover:bg-muted flex items-center gap-2.5 px-3 py-2 text-sm transition"
                >
                  <Icon
                    icon={Icons.edit}
                    className="text-muted-foreground h-4 w-4 shrink-0"
                  />
                  Editar
                </Link>
                <div className="bg-border my-1 h-px" />
                <button
                  type="button"
                  role="menuitem"
                  disabled={isDeactivating}
                  onClick={requestDeactivate}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/40"
                >
                  <Icon icon={Icons.trash} className="h-4 w-4 shrink-0" />
                  {isDeactivating ? "Desativando…" : "Desativar"}
                </button>
              </>
            ) : null}
          </div>,
          document.body,
        )}

      <ConfirmDialog
        open={confirmOpen}
        variant="danger"
        title={`Desativar ${name}?`}
        description="O produto deixará de aparecer no catálogo."
        confirmLabel="Desativar"
        cancelLabel="Cancelar"
        onConfirm={confirmDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
