import type { UserRole } from "@/shared/auth/roles";
import type { ProductResponse } from "@/features/product/types";
import type { CustomerResponse } from "@/features/customer/types";
import type { EmployeeWithUser } from "@/features/employee/types";
import type { PlanResponse } from "@/features/plan/types";
import type {
  SaleCustomer,
  SaleProduct,
  SaleResponse,
} from "@/features/sale/types";

export function apiSuccess<T>(data: T) {
  return {
    data,
    error: null,
    success: true,
    timestamp: "2026-05-26T00:00:00.000Z",
  };
}

export function apiError(
  status: number,
  message: string,
  details?: Array<{ field: string; message: string[] }>,
) {
  return {
    data: null,
    error: {
      code: status === 409 ? "CONFLICT" : `HTTP_${status}`,
      details,
      message,
    },
    success: false,
    timestamp: "2026-05-26T00:00:00.000Z",
  };
}

export function sessionUser(role: UserRole = "GERENTE") {
  return {
    id: "user-id",
    role,
    userName: role === "GERENTE" ? "gerente" : "funcionario",
  };
}

export function paginated<T>(
  data: T[],
  pageNumber = 1,
  pageSize = data.length,
) {
  const totalCount = data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return {
    data,
    hasNextPage: pageNumber < totalPages,
    hasPreviousPage: pageNumber > 1,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
  };
}

export function product(
  overrides: Partial<ProductResponse> = {},
): ProductResponse {
  return {
    id: "product-id",
    name: "Água Mineral 20L",
    price: 12.5,
    quantity: 10,
    type: "Water",
    ...overrides,
  };
}

export function saleProduct(overrides: Partial<SaleProduct> = {}): SaleProduct {
  return {
    id: "product-id",
    name: "Água Mineral 20L",
    price: 12.5,
    quantity: 10,
    type: "Water",
    ...overrides,
  };
}

export function customer(
  overrides: Partial<CustomerResponse> = {},
): CustomerResponse {
  return {
    address: {
      cep: "12345678",
      city: "São Paulo",
      complement: null,
      id: "address-id",
      neighborhood: "Centro",
      number: "123",
      street: "Rua das Águas",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    document: "52998224725",
    email: "cliente@example.com",
    id: "customer-id",
    name: "Maria Silva",
    phone: "11999998888",
    typeDocument: "PF",
    ...overrides,
  };
}

export function saleCustomer(
  overrides: Partial<SaleCustomer> = {},
): SaleCustomer {
  return {
    document: "52998224725",
    id: "customer-id",
    name: "Maria Silva",
    phone: "11999998888",
    typeDocument: "PF",
    ...overrides,
  };
}

export function employeeWithUser(
  overrides: Partial<EmployeeWithUser> = {},
): EmployeeWithUser {
  return {
    employee: {
      cpf: "52998224725",
      email: "ana@example.com",
      id: "employee-id",
      name: "Ana Gerente",
      phone: "11999998888",
    },
    user: {
      role: "Manager",
      userId: "user-id",
      userName: "gerente",
    },
    ...overrides,
  };
}

export function sale(overrides: Partial<SaleResponse> = {}): SaleResponse {
  return {
    cancelReason: null,
    createdAt: "2026-05-20T12:00:00.000Z",
    customer: {
      document: "52998224725",
      id: "customer-id",
      name: "Maria Silva",
    },
    discount: 0,
    employee: {
      id: "employee-id",
      name: "Ana Gerente",
    },
    id: "sale-id",
    items: [
      {
        productId: "product-id",
        productName: "Água Mineral 20L",
        quantity: 2,
        total: 25,
      },
    ],
    status: "Finished",
    subtotal: 25,
    total: 25,
    ...overrides,
  };
}

export function plan(overrides: Partial<PlanResponse> = {}): PlanResponse {
  return {
    billingDay: 10,
    billings: [],
    cycle: "Monthly",
    customerId: "customer-id",
    customerName: "Maria Silva",
    deliveries: [],
    deliveryDay: 5,
    discount: null,
    document: "52998224725",
    employeeId: "employee-id",
    employeeName: "Ana Gerente",
    endDate: "2026-12-31T00:00:00.000Z",
    id: "plan-id",
    items: [],
    penalties: [],
    startDate: "2026-01-01T00:00:00.000Z",
    status: "Active",
    total: 120,
    warning: null,
    ...overrides,
  };
}
