export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => number | string | null | undefined;
};

function escapeCell(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",;\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((c) => escapeCell(c.header)).join(";");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(c.accessor(row))).join(";"),
  );
  // BOM para o Excel detectar UTF-8 e exibir acentuação correta.
  return "﻿" + [headerLine, ...lines].join("\n");
}

export function downloadCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  filename: string,
): void {
  const csv = buildCsv(rows, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
