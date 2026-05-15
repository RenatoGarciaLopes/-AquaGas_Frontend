"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import type { EmployeeWithUser } from "@/features/employee/types";

type RowActionsProps = {
  canManage: boolean;
  employee: EmployeeWithUser;
};

type MenuPosition = { top: number; right: number };

export function RowActions({ canManage, employee }: RowActionsProps) {
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { id, name } = employee.employee;

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

  async function handleDeactivate() {
    closeMenu();
    const confirmed = window.confirm(
      `Desativar ${name}? Esta ação impedirá o acesso do funcionário ao sistema.`,
    );
    if (!confirmed) return;

    setIsDeactivating(true);
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });

      if (res.status === 401) {
        router.push("/login?expired=1");
        return;
      }
      if (res.status === 403) {
        toast.error("Sem permissão para desativar funcionários.");
        return;
      }
      if (!res.ok) {
        toast.error("Não foi possível desativar o funcionário.");
        return;
      }

      toast.success(`${name} foi desativado com sucesso.`);
      router.refresh();
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
        className="inline-flex cursor-pointer items-center rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-muted focus:ring-2 focus:ring-ring/40 focus:outline-none"
      >
        <Icon icon={Icons.moreHorizontal} aria-hidden className="h-4 w-4" />
      </button>

      {menuPos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: menuPos.top, right: menuPos.right }}
            className="fixed z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg shadow-black/10"
          >
            <Link
              href={`/employees/${id}`}
              role="menuitem"
              onClick={closeMenu}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition hover:bg-muted"
            >
              <Icon icon={Icons.eye} className="h-4 w-4 shrink-0 text-muted-foreground" />
              Ver
            </Link>
            {canManage ? (
              <>
                <Link
                  href={`/employees/${id}/edit`}
                  role="menuitem"
                  onClick={closeMenu}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                >
                  <Icon icon={Icons.edit} className="h-4 w-4 shrink-0 text-muted-foreground" />
                  Editar
                </Link>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  role="menuitem"
                  disabled={isDeactivating}
                  onClick={handleDeactivate}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon icon={Icons.trash} className="h-4 w-4 shrink-0" />
                  {isDeactivating ? "Desativando…" : "Desativar"}
                </button>
              </>
            ) : null}
          </div>,
          document.body,
        )}
    </>
  );
}
