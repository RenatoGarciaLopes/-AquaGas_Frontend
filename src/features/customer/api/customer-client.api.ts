import { apiPost } from "@/shared/api/client";

import type {
  CustomerResponse,
  RegisterCustomerInput,
} from "@/features/customer/types";

import type { ApiResponse } from "@/shared/types/api";

export async function createCustomer(input: RegisterCustomerInput) {
  return apiPost<ApiResponse<CustomerResponse>, RegisterCustomerInput>(
    "/api/customers",
    input,
  );
}
