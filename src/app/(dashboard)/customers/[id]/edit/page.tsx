import { notFound, redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";

import { getCustomerById } from "@/features/customer/api/customer.api";
import { EditCustomerForm } from "@/features/customer/components/edit-customer-form";

type EditCustomerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;

  let customer;
  try {
    customer = await getCustomerById(id);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login?expired=1");
      if (error.status === 404) notFound();
      if (error.status === 403) {
        return (
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <ErrorState
              title="Sem permissão"
              description="Você não tem acesso a este cliente."
            />
          </div>
        );
      }
    }
    throw error;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Editar cliente" description={customer.name} />
      <EditCustomerForm customer={customer} />
    </div>
  );
}
