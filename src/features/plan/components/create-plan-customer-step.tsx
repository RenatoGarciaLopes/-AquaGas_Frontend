"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import {
  formatCnpj,
  onlyDigits,
  formatCpfMasked,
} from "@/shared/lib/formatters";

type Customer = {
  id: string;
  name: string;
  document: string;
  typeDocument?: string;
};

type CreatePlanCustomerStepProps = {
  customers: Customer[];
  selectedId: string;
  onSelect: (customerId: string) => void;
  error?: string;
};

function formatDocument(customer: Customer) {
  if (customer.typeDocument === "PJ") return formatCnpj(customer.document);
  return formatCpfMasked(customer.document);
}

export function CreatePlanCustomerStep({
  customers,
  selectedId,
  onSelect,
  error,
}: CreatePlanCustomerStepProps) {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  const numericTerm = onlyDigits(term);

  const filtered = useMemo(() => {
    if (!term) return customers.slice(0, 8);
    return customers
      .filter((c) => {
        const doc = onlyDigits(c.document);
        return (
          c.name.toLowerCase().includes(term) ||
          (numericTerm !== "" && doc.includes(numericTerm))
        );
      })
      .slice(0, 8);
  }, [customers, numericTerm, term]);

  const selected = customers.find((c) => c.id === selectedId);

  return (
    <div className="space-y-4">
      {selected ? (
        <div className="border-border bg-card flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-foreground font-medium">{selected.name}</p>
            <p className="text-muted-foreground font-mono text-sm">
              {formatDocument(selected)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect("")}
            className="text-muted-foreground hover:text-foreground text-sm transition"
          >
            Alterar
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Icon
              icon={Icons.search}
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente por nome ou documento…"
              aria-label="Buscar cliente"
              className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm transition focus:ring-2 focus:outline-none"
            />
          </div>

          {error ? (
            <p className="px-1 text-xs font-medium text-red-700 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <div className="divide-border border-border max-h-80 divide-y overflow-y-auto rounded-lg border">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground p-4 text-center text-sm">
                Nenhum cliente encontrado.
              </p>
            ) : (
              filtered.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => onSelect(customer.id)}
                  className="hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-3 text-left transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                    <Icon
                      icon={Icons.users}
                      className="h-4 w-4"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {customer.name}
                    </p>
                    <p className="text-muted-foreground truncate font-mono text-xs">
                      {formatDocument(customer)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
