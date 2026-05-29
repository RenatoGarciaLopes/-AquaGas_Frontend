import { notFound, redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { ErrorState } from "@/shared/ui/error-state";
import { getCurrentUserRole } from "@/shared/auth/server";

import { getCustomerById } from "@/features/customer/api/customer.api";
import { CustomerDetail } from "@/features/customer/components/customer-detail";

type CustomerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { id } = await params;

  const role = await getCurrentUserRole();
  const canManage = isGerente(role);

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
              description="Você não tem acesso aos dados deste cliente."
            />
          </div>
        );
      }
    }
    throw error;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <CustomerDetail customer={customer} canManage={canManage} />
    </div>
  );
}
