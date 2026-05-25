import { apiPost, apiPatch } from "@/shared/api/client";

import type {
  CustomerResponse,
  UpdateCustomerInput,
  RegisterCustomerInput,
} from "@/features/customer/types";

import type { ApiResponse } from "@/shared/types/api";

export async function createCustomer(input: RegisterCustomerInput) {
  return apiPost<ApiResponse<CustomerResponse>, RegisterCustomerInput>(
    "/api/customers",
    input,
  );
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  return apiPatch<ApiResponse<CustomerResponse>, UpdateCustomerInput>(
    `/api/customers/${encodeURIComponent(id)}`,
    input,
  );
}
