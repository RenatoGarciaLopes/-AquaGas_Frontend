import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProviders } from "@/__tests__/test-utils";
import { DataTable } from "@/shared/ui/data-table";

type Row = {
  id: string;
  name: string;
};

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    cell: ({ getValue }) => <span>{getValue<string>()}</span>,
    enableSorting: true,
    header: "Nome",
    id: "name",
  },
];

describe("DataTable", () => {
  it("renderiza linhas, sort e paginação", () => {
    const onSortChange = vi.fn();
    const onPageChange = vi.fn();

    renderWithProviders(
      <DataTable
        columns={columns}
        data={[
          { id: "1", name: "Ana" },
          { id: "2", name: "Bruno" },
        ]}
        onSortChange={onSortChange}
        pagination={{
          hasNextPage: true,
          hasPreviousPage: false,
          onPageChange,
          pageNumber: 1,
          pageSize: 2,
          totalCount: 5,
          totalPages: 3,
        }}
      />,
    );

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1–2 de 5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /nome/i }));
    expect(onSortChange).toHaveBeenCalledWith("name:asc");

    fireEvent.click(screen.getByRole("button", { name: /próxima/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("renderiza empty state quando não há linhas", () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[]}
        emptyState={<p>Nenhum registro</p>}
      />,
    );

    expect(screen.getByText("Nenhum registro")).toBeInTheDocument();
  });
});
