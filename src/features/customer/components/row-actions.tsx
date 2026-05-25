"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useRef, useState, useEffect } from "react";

import { Icons } from "@/shared/lib/icons";

import type { CustomerResponse } from "@/features/customer/types";

type RowActionsProps = {
  customer: CustomerResponse;
};

type MenuPosition = { top: number; right: number };

export function RowActions({ customer }: RowActionsProps) {
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { id, name } = customer;

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

    function onPointerDown(event: PointerEvent) {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        closeMenu();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuPos]);

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
              href={`/customers/${id}/edit`}
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
          </div>,
          document.body,
        )}
    </>
  );
}
