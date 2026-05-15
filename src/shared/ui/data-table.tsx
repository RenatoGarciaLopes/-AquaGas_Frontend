"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import {
  flexRender,
  useReactTable,
  type ColumnDef,
  getCoreRowModel,
  type SortingState,
} from "@tanstack/react-table";

import { Icons } from "@/shared/lib/icons";

// ─── Pagination ───────────────────────────────────────────────────────────────

export type DataTablePagination = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

// ─── Props ────────────────────────────────────────────────────────────────────

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyState?: ReactNode;
  onSortChange?: (sort: string | undefined) => void;
  pagination?: DataTablePagination;
  /** Formato "campo:asc" | "campo:desc" */
  sort?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSortState(sort?: string): SortingState {
  if (!sort) return [];
  const [id, dir] = sort.split(":");
  if (!id) return [];
  return [{ id, desc: dir === "desc" }];
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return <Icon icon={Icons.arrowUp} aria-hidden className="h-3.5 w-3.5" />;
  if (sorted === "desc")
    return <Icon icon={Icons.arrowDown} aria-hidden className="h-3.5 w-3.5" />;
  return (
    <Icon
      icon={Icons.arrowUpDown}
      aria-hidden
      className="h-3.5 w-3.5 opacity-40"
    />
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DataTable<TData>({
  columns,
  data,
  emptyState,
  onSortChange,
  pagination,
  sort,
}: DataTableProps<TData>) {
  const sorting = parseSortState(sort);

  const table = useReactTable<TData>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (!next.length) {
        onSortChange?.(undefined);
      } else {
        const { id, desc } = next[0]!;
        onSortChange?.(`${id}:${desc ? "desc" : "asc"}`);
      }
    },
    state: { sorting },
  });

  const { rows } = table.getRowModel();

  return (
    <section className="space-y-3">
      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-border bg-muted/40 text-muted-foreground border-b text-xs uppercase">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-4 py-3 font-medium"
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="hover:text-foreground focus:ring-ring inline-flex items-center gap-1 transition focus:ring-2 focus:outline-none"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            <SortIcon sorted={sorted} />
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-border divide-y">
              {rows.length === 0 && emptyState ? (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    {emptyState}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="text-foreground hover:bg-muted/30 transition"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <PaginationBar pagination={pagination} rowCount={rows.length} />
      )}
    </section>
  );
}

// ─── PaginationBar ────────────────────────────────────────────────────────────

function PaginationBar({
  pagination,
  rowCount,
}: {
  pagination: DataTablePagination;
  rowCount: number;
}) {
  const start =
    pagination.totalCount === 0
      ? 0
      : (pagination.pageNumber - 1) * pagination.pageSize + 1;
  const end = start + rowCount - 1;

  return (
    <div className="text-muted-foreground flex flex-col gap-3 px-1 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>
        Mostrando {start}–{end} de {pagination.totalCount}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!pagination.hasPreviousPage}
          onClick={() =>
            pagination.onPageChange(Math.max(1, pagination.pageNumber - 1))
          }
          className="border-border bg-card text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon icon={Icons.chevronLeft} aria-hidden className="h-3.5 w-3.5" />
          Anterior
        </button>
        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() => pagination.onPageChange(pagination.pageNumber + 1)}
          className="border-border bg-card text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Próxima
          <Icon icon={Icons.chevronRight} aria-hidden className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
