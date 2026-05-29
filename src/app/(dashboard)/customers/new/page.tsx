import { PageHeader } from "@/shared/ui/page-header";

import { CreateCustomerForm } from "@/features/customer/components/create-customer-form";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Cadastrar cliente"
        description="Adicione um novo cliente ao sistema."
      />
      <CreateCustomerForm />
    </div>
  );
}
