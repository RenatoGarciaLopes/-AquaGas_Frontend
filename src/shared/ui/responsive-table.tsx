"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type ResponsiveTableProps = {
  children: ReactNode;
  className?: string;
};

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function updateOverflow() {
      if (!el) return;
      const overflowing = el.scrollWidth - el.clientWidth - el.scrollLeft > 4;
      setHasOverflow(overflowing);
    }

    updateOverflow();
    el.addEventListener("scroll", updateOverflow, { passive: true });
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateOverflow);
      observer.disconnect();
    };
  }, [children]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        data-overflow={hasOverflow}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "from-card pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l to-transparent opacity-0 transition-opacity",
          hasOverflow && "opacity-100",
        )}
      />
    </div>
  );
}
