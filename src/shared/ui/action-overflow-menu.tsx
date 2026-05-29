"use client";

import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useRef, useState, useEffect, type ReactNode } from "react";

import { useIsMobile } from "@/shared/hooks/use-media-query";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

export type OverflowMenuItem = {
  id: string;
  label: string;
  icon?: typeof Icons.x;
  /** Estilo visual do item — "danger" usa vermelho. */
  intent?: "default" | "danger";
  disabled?: boolean;
  onSelect: () => void;
};

type ActionOverflowMenuProps = {
  /** Botão principal sempre visível (mesmo em mobile). */
  primary?: ReactNode;
  /** Itens adicionais. Em md+ podem ser renderizados como botões inline (via `renderItem`). */
  items: OverflowMenuItem[];
  /** Renderiza cada item como um elemento React (usado em md+ para botões inline). Se ausente, sempre usa o menu. */
  renderItem?: (item: OverflowMenuItem) => ReactNode;
  ariaLabel?: string;
  /** Disabled state do botão kebab (ex: enquanto uma mutation está pendente). */
  disabled?: boolean;
};

/**
 * Em mobile (<md): renderiza `primary` + botão kebab que abre os `items` num menu.
 * Em md+: renderiza `primary` + os `items` como botões inline (via `renderItem`).
 */
export function ActionOverflowMenu({
  ariaLabel = "Mais ações",
  disabled = false,
  items,
  primary,
  renderItem,
}: ActionOverflowMenuProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const right = Math.max(8, window.innerWidth - rect.right);
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      right,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const showInline = !isMobile && typeof renderItem === "function";
  const inlineItems = showInline ? items.filter((item) => !item.disabled) : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {primary}

      {showInline ? inlineItems.map((item) => renderItem!(item)) : null}

      {!showInline && items.length > 0 ? (
        <>
          <button
            ref={triggerRef}
            type="button"
            aria-label={ariaLabel}
            aria-haspopup="menu"
            aria-expanded={open}
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 focus-visible:ring-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-transparent transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon icon={Icons.moreHorizontal} className="h-5 w-5" aria-hidden />
          </button>

          {open && menuPos && typeof window !== "undefined"
            ? createPortal(
                <div
                  ref={menuRef}
                  role="menu"
                  style={{ top: menuPos.top, right: menuPos.right }}
                  className="border-border bg-card fixed z-50 min-w-52 rounded-lg border p-1 shadow-lg shadow-black/10"
                >
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      onClick={() => {
                        item.onSelect();
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition",
                        item.intent === "danger"
                          ? "text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                          : "text-foreground hover:bg-muted/60",
                        item.disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      {item.icon ? (
                        <Icon
                          icon={item.icon}
                          className="h-4 w-4"
                          aria-hidden
                        />
                      ) : null}
                      <span className="flex-1 truncate">{item.label}</span>
                    </button>
                  ))}
                </div>,
                document.body,
              )
            : null}
        </>
      ) : null}
    </div>
  );
}
