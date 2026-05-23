import Link from "next/link";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import { numberToBrl } from "@/shared/lib/masks";

import { DataList } from "@/shared/ui/data-list";
import { InfoCard } from "@/shared/ui/info-card";
import { StatCard } from "@/shared/ui/stat-card";
import { EntityHeader } from "@/shared/ui/entity-header";
import { DetailShell } from "@/shared/layouts/detail-shell";

import type { ProductResponse } from "@/features/product/types";
import { ProductTypeBadge } from "@/features/product/components/product-type-badge";
import { ProductStatusBadge } from "@/features/product/components/product-status-badge";
import {
  getStockLevel,
  PRODUCT_TYPE_LABEL,
  LOW_STOCK_THRESHOLD,
} from "@/features/product/lib/product-format";

type ProductDetailProps = {
  canManage: boolean;
  product: ProductResponse;
};

const STOCK_LEVEL_LABEL = {
  out: "Sem estoque",
  low: "Baixo",
  ok: "Normal",
} as const;

const STOCK_LEVEL_ACCENT = {
  out: "danger",
  low: "warning",
  ok: "success",
} as const;

const STOCK_LEVEL_HINT = {
  out: "Reponha o estoque para continuar vendendo.",
  low: `Abaixo de ${LOW_STOCK_THRESHOLD} unidades.`,
  ok: `Acima de ${LOW_STOCK_THRESHOLD} unidades.`,
} as const;

export function ProductDetail({ canManage, product }: ProductDetailProps) {
  const level = getStockLevel(product.quantity);
  const isWater = product.type === "Water";

  return (
    <DetailShell
      back={
        <Link
          href="/products"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
        >
          <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
          Voltar para produtos
        </Link>
      }
      header={
        <EntityHeader
          icon={isWater ? Icons.droplets : Icons.flame}
          title={product.name}
          badges={
            <>
              <ProductTypeBadge type={product.type} />
              <ProductStatusBadge isActive />
            </>
          }
          meta={<span className="font-mono text-xs">ID: {product.id}</span>}
          actions={
            canManage ? (
              <Link
                href={`/products/${product.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
              >
                <Icon icon={Icons.edit} className="h-4 w-4" aria-hidden />
                Editar produto
              </Link>
            ) : null
          }
        />
      }
      hero={
        <>
          <StatCard
            label="Preço unitário"
            value={`R$ ${numberToBrl(product.price)}`}
            hint="Por unidade vendida"
          />
          <StatCard
            label="Estoque atual"
            value={`${product.quantity} ${product.quantity === 1 ? "unidade" : "unidades"}`}
            hint="Quantidade disponível para venda"
          />
          <StatCard
            label="Nível de estoque"
            value={STOCK_LEVEL_LABEL[level]}
            hint={STOCK_LEVEL_HINT[level]}
            accent={STOCK_LEVEL_ACCENT[level]}
            icon={
              level === "out"
                ? Icons.alertTriangle
                : level === "low"
                  ? Icons.alertTriangle
                  : Icons.check
            }
          />
        </>
      }
    >
      <InfoCard
        title="Identificação"
        description="Dados cadastrais do produto."
      >
        <DataList
          items={[
            { label: "Nome", value: product.name },
            {
              label: "Tipo",
              value: PRODUCT_TYPE_LABEL[product.type],
            },
            { label: "Status", value: <ProductStatusBadge isActive /> },
            {
              label: "Identificador",
              value: (
                <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                  {product.id}
                </code>
              ),
            },
          ]}
        />
      </InfoCard>

      <InfoCard
        title="Operação"
        description="Parâmetros operacionais e ações rápidas."
        action={
          canManage ? (
            <Link
              href={`/products/${product.id}/edit?tab=stock`}
              className="text-sm font-semibold text-cyan-500 transition hover:text-cyan-600"
            >
              Ajustar estoque →
            </Link>
          ) : null
        }
      >
        <DataList
          items={[
            {
              label: "Quantidade em estoque",
              value: `${product.quantity} un.`,
            },
            {
              label: "Limite de baixo estoque",
              value: `${LOW_STOCK_THRESHOLD} un.`,
            },
            {
              label: "Última movimentação",
              value: null,
              emptyFallback: "Não disponível",
            },
          ]}
        />
      </InfoCard>
    </DetailShell>
  );
}
