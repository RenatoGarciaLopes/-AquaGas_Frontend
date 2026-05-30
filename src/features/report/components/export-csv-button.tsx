"use client";

import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import { downloadCsv, type CsvColumn } from "@/shared/lib/csv";

type Props<T> = {
  rows: T[];
  columns: CsvColumn<T>[];
  filename: string;
  label?: string;
  disabled?: boolean;
};

export function ExportCsvButton<T>({
  columns,
  disabled,
  filename,
  label = "Exportar CSV",
  rows,
}: Props<T>) {
  const isEmpty = disabled || rows.length === 0;

  return (
    <button
      type="button"
      onClick={() => downloadCsv(rows, columns, filename)}
      disabled={isEmpty}
      className="border-border bg-card text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon icon={Icons.fileText} aria-hidden className="h-4 w-4" />
      {label}
    </button>
  );
}
