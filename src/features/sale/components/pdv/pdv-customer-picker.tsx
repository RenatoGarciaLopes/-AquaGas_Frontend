"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";

import { Icons } from "@/shared/lib/icons";
import {
  formatCnpj,
  onlyDigits,
  formatPhone,
  formatCpfMasked,
} from "@/shared/lib/formatters";

import type { SaleCustomer } from "@/features/sale/types";

type PdvCustomerPickerProps = {
  customers: SaleCustomer[];
  selected: SaleCustomer | null;
  onSelect: (customer: SaleCustomer | null) => void;
};

function formatDocument(customer: SaleCustomer) {
  if (customer.typeDocument === "PJ") return formatCnpj(customer.document);
  return formatCpfMasked(customer.document);
}

export function PdvCustomerPicker({
  customers,
  selected,
  onSelect,
}: PdvCustomerPickerProps) {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  const numericTerm = onlyDigits(term);

  const filtered = useMemo(() => {
    if (!term) return customers.slice(0, 5);
    return customers
      .filter((customer) => {
        const document = onlyDigits(customer.document);
        const phone = onlyDigits(customer.phone);
        return (
          customer.name.toLowerCase().includes(term) ||
          (numericTerm !== "" &&
            (document.includes(numericTerm) || phone.includes(numericTerm)))
        );
      })
      .slice(0, 5);
  }, [customers, numericTerm, term]);

  return (
    <section className="border-border bg-card rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-foreground text-base font-semibold">Cliente</h2>
          <p className="text-muted-foreground text-sm">
            Opcional para venda balcão.
          </p>
        </div>
        {selected ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-primary hover:text-primary/80 text-xs font-semibold transition"
          >
            Usar balcão
          </button>
        ) : null}
      </div>

      {selected ? (
        <div className="border-primary/30 bg-primary/10 mt-3 rounded-lg border p-3">
          <p className="text-foreground text-sm font-medium">{selected.name}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {formatDocument(selected)}
            {selected.phone ? ` · ${formatPhone(selected.phone)}` : ""}
          </p>
        </div>
      ) : (
        <div className="border-border bg-muted/30 text-muted-foreground mt-3 rounded-lg border p-3 text-sm">
          Venda sem cliente identificado.
        </div>
      )}

      <label className="relative mt-3 block">
        <span className="sr-only">Buscar cliente</span>
        <Icon
          icon={Icons.search}
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar cliente..."
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring/40 w-full rounded-lg border py-2.5 pr-3 pl-9 text-sm focus:ring-2"
        />
      </label>

      {search || filtered.length > 0 ? (
        <div className="border-border mt-3 max-h-64 overflow-auto rounded-lg border">
          {filtered.length === 0 ? (
            <div className="text-muted-foreground px-3 py-4 text-center text-sm">
              Nenhum cliente encontrado.
            </div>
          ) : (
            filtered.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => {
                  onSelect(customer);
                  setSearch("");
                }}
                className="border-border hover:bg-muted/50 block w-full border-b px-3 py-2.5 text-left last:border-b-0"
              >
                <span className="text-foreground block text-sm font-medium">
                  {customer.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatDocument(customer)}
                  {customer.phone ? ` · ${formatPhone(customer.phone)}` : ""}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
