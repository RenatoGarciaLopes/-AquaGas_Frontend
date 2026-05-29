"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/shared/lib/cn";

type Option = { value: string; label: string };

type Props = {
  paramKey: string;
  value: string | undefined;
  options: Option[];
  placeholder: string;
  className?: string;
};

export function FilterSelect({
  className,
  options,
  paramKey,
  placeholder,
  value,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (!next) params.delete(paramKey);
    else params.set(paramKey, next);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <label className={cn("relative block min-w-40", className)}>
      <span className="text-muted-foreground absolute top-1.5 left-4 text-xs font-medium">
        {placeholder}
      </span>
      <select
        value={value ?? ""}
        onChange={handleChange}
        className="bg-muted/40 hover:bg-muted/60 focus:bg-muted/60 text-foreground w-full appearance-none rounded-lg px-4 pt-5 pb-2 text-sm transition focus:outline-none"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
