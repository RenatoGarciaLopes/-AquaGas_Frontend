import Link from "next/link";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import {
  formatCpf,
  formatCnpj,
  formatDate,
  formatPhone,
} from "@/shared/lib/formatters";

import { DataList } from "@/shared/ui/data-list";
import { InfoCard } from "@/shared/ui/info-card";
import { StatCard } from "@/shared/ui/stat-card";
import { EntityHeader } from "@/shared/ui/entity-header";
import { DetailShell } from "@/shared/layouts/detail-shell";

import type { CustomerResponse } from "@/features/customer/types";
import { CustomerTypeBadge } from "@/features/customer/components/customer-type-badge";
import { DeactivateCustomerButton } from "@/features/customer/components/deactivate-customer-button";

type CustomerDetailProps = {
  canManage: boolean;
  customer: CustomerResponse;
};

function formatDocument(customer: CustomerResponse) {
  if (customer.typeDocument === "PJ") return formatCnpj(customer.document);
  return formatCpf(customer.document);
}

export function CustomerDetail({ canManage, customer }: CustomerDetailProps) {
  const formattedDocument = formatDocument(customer);
  const typeLabel =
    customer.typeDocument === "PJ" ? "Pessoa Jurídica" : "Pessoa Física";

  return (
    <DetailShell
      back={
        <Link
          href="/customers"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
        >
          <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
          Voltar para clientes
        </Link>
      }
      header={
        <EntityHeader
          icon={Icons.users}
          title={customer.name}
          subtitle={formattedDocument}
          badges={<CustomerTypeBadge type={customer.typeDocument} />}
          meta={
            <span>
              ID: <span className="font-mono">{customer.id}</span>
              {" · "}
              Cadastrado em {formatDate(customer.createdAt)}
            </span>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/customers/${customer.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
              >
                <Icon icon={Icons.edit} className="h-4 w-4" aria-hidden />
                Editar
              </Link>
              {canManage ? (
                <DeactivateCustomerButton
                  id={customer.id}
                  name={customer.name}
                />
              ) : null}
            </div>
          }
        />
      }
      hero={
        <>
          <StatCard
            label="Tipo de pessoa"
            value={typeLabel}
            hint={
              customer.typeDocument === "PJ"
                ? "Cadastrado com CNPJ"
                : "Cadastrado com CPF"
            }
            icon={Icons.userCog}
          />
          <StatCard
            label="Telefone"
            value={formatPhone(customer.phone)}
            hint="Contato principal"
            icon={Icons.phone}
          />
          <StatCard
            label="E-mail"
            value={customer.email || null}
            hint="Endereço de e-mail"
            emptyFallback="Não informado"
          />
        </>
      }
    >
      <InfoCard
        title="Identificação"
        description="Dados cadastrais do cliente."
      >
        <DataList
          items={[
            { label: "Nome completo", value: customer.name },
            { label: "Documento", value: formattedDocument },
            {
              label: "Tipo",
              value: <CustomerTypeBadge type={customer.typeDocument} />,
            },
            {
              label: "Cadastrado em",
              value: formatDate(customer.createdAt),
            },
            {
              label: "Identificador",
              value: (
                <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                  {customer.id}
                </code>
              ),
            },
          ]}
        />
      </InfoCard>

      <InfoCard
        title="Contato"
        description="Informações de contato do cliente."
        action={
          <Link
            href={`/customers/${customer.id}/edit`}
            className="text-sm font-semibold text-cyan-500 transition hover:text-cyan-600"
          >
            Editar →
          </Link>
        }
      >
        <DataList
          items={[
            {
              label: "Telefone",
              value: formatPhone(customer.phone),
              emptyFallback: "Não informado",
            },
            {
              label: "E-mail",
              value: customer.email,
              emptyFallback: "Não informado",
            },
          ]}
        />
      </InfoCard>

      <InfoCard
        title="Endereço"
        description="Endereço de entrega principal."
        className="lg:col-span-2"
        action={
          customer.address ? (
            <Link
              href={`/customers/${customer.id}/edit`}
              className="text-sm font-semibold text-cyan-500 transition hover:text-cyan-600"
            >
              Editar →
            </Link>
          ) : null
        }
      >
        {customer.address ? (
          <DataList
            items={[
              {
                label: "CEP",
                value: customer.address.cep,
                emptyFallback: "Não informado",
              },
              {
                label: "Logradouro",
                value:
                  [customer.address.street, customer.address.number]
                    .filter(Boolean)
                    .join(", ") || null,
                emptyFallback: "Não informado",
              },
              {
                label: "Bairro",
                value: customer.address.neighborhood,
                emptyFallback: "Não informado",
              },
              {
                label: "Cidade",
                value: customer.address.city,
                emptyFallback: "Não informado",
              },
              {
                label: "Complemento",
                value: customer.address.complement,
                emptyFallback: "Não informado",
              },
            ]}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            Nenhum endereço cadastrado.{" "}
            <Link
              href={`/customers/${customer.id}/edit`}
              className="font-semibold text-cyan-500 transition hover:text-cyan-600"
            >
              Adicionar endereço →
            </Link>
          </p>
        )}
      </InfoCard>
    </DetailShell>
  );
}
