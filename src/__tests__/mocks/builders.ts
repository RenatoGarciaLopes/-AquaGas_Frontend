import type { UserRole } from "@/shared/auth/roles";

import type { PlanResponse } from "@/features/plan/types";
import type { ProductResponse } from "@/features/product/types";
import type { CustomerResponse } from "@/features/customer/types";
import type { EmployeeWithUser } from "@/features/employee/types";
import type {
  SaleProduct,
  SaleCustomer,
  SaleResponse,
} from "@/features/sale/types";
import type {
  SalesReport,
  PenaltyReport,
  SalesReportItem,
  StockMovementItem,
  PenaltyReportItem,
  StockMovementReport,
} from "@/features/report/types";

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
    billings: [
      {
        amount: 120,
        dueDate: "2026-06-10T00:00:00.000Z",
        id: "billing-id",
        paidAt: null,
        receivedBy: null,
        status: "Pending",
      },
    ],
    cycle: "Monthly",
    customerId: "customer-id",
    customerName: "Maria Silva",
    deliveries: [
      {
        deliveryDate: null,
        dueDate: "2026-06-05T00:00:00.000Z",
        id: "delivery-id",
        period: 1,
        status: "Pending",
      },
    ],
    deliveryDay: 5,
    discount: null,
    document: "52998224725",
    employeeId: "employee-id",
    employeeName: "Ana Gerente",
    endDate: "2026-12-31T00:00:00.000Z",
    id: "plan-id",
    items: [
      {
        productId: "product-id",
        productName: "Água Mineral 20L",
        quantity: 2,
      },
    ],
    penalties: [
      {
        calculatedAmount: 30,
        cancelReason: null,
        canceledAt: null,
        canceledBy: null,
        dueDate: "2026-06-15T00:00:00.000Z",
        id: "penalty-id",
        notes: null,
        originalValue: 120,
        paidBy: null,
        paidDate: null,
        planId: "plan-id",
        remainingValue: 30,
        status: "PendingPayment",
        timestamp: "2026-05-26T00:00:00.000Z",
        type: "Downgrade",
        waiveReason: null,
        waivedAt: null,
        waivedBy: null,
      },
    ],
    startDate: "2026-01-01T00:00:00.000Z",
    status: "Active",
    total: 120,
    warning: null,
    ...overrides,
  };
}

export function salesReportItem(
  overrides: Partial<SalesReportItem> = {},
): SalesReportItem {
  return {
    customer: { id: "customer-id", name: "Maria Silva" },
    date: "2026-05-20T12:00:00.000Z",
    employee: { id: "employee-id", name: "Ana Gerente" },
    id: "sale-report-id",
    items: [
      {
        productId: "product-id",
        productName: "Água Mineral 20L",
        quantity: 2,
        subtotal: 25,
        unitPrice: 12.5,
      },
    ],
    itemsCount: 1,
    status: "FINISHED",
    total: 25,
    type: "SALE",
    ...overrides,
  };
}

export function salesReport(overrides: Partial<SalesReport> = {}): SalesReport {
  const items = overrides.items ?? [
    salesReportItem(),
    salesReportItem({
      id: "plan-sale-report-id",
      status: "CANCELLED",
      total: 120,
      type: "PLAN",
    }),
  ];

  return {
    items,
    summary: {
      averageTicket: 25,
      cancelledSales: 1,
      period: {
        end: "2026-05-31T23:59:59.999Z",
        start: "2026-05-01T00:00:00.000Z",
      },
      totalContractSales: 120,
      totalRevenue: 25,
      totalSales: 1,
      totalSpotSales: 25,
    },
    ...overrides,
  };
}

export function stockMovementItem(
  overrides: Partial<StockMovementItem> = {},
): StockMovementItem {
  return {
    customer: { id: "customer-id", name: "Maria Silva" },
    date: "2026-05-20T12:00:00.000Z",
    employee: { id: "employee-id", name: "Ana Gerente" },
    id: "stock-movement-id",
    product: { id: "product-id", name: "Água Mineral 20L" },
    quantity: 4,
    reason: "Reposição",
    reference: null,
    type: "Entry",
    ...overrides,
  };
}

export function stockMovementReport(
  overrides: Partial<StockMovementReport> = {},
): StockMovementReport {
  return {
    items: [
      stockMovementItem(),
      stockMovementItem({
        id: "stock-exit-id",
        quantity: 2,
        reason: "Venda",
        type: "Exit",
      }),
    ],
    ...overrides,
  };
}

export function penaltyReportItem(
  overrides: Partial<PenaltyReportItem> = {},
): PenaltyReportItem {
  return {
    audit: {
      canBeCanceled: true,
      canBePaid: true,
      canBeWaived: true,
    },
    createdBy: { id: "employee-id", name: "Ana Gerente" },
    customer: { id: "customer-id", name: "Maria Silva" },
    date: "2026-05-20T12:00:00.000Z",
    dueDate: "2026-06-15T00:00:00.000Z",
    financial: {
      calculatedValue: 30,
      originalValue: 120,
      remainingValue: 30,
    },
    id: "penalty-report-id",
    notes: null,
    origin: { id: "plan-id", type: "PLAN_DOWNGRADE" },
    paidAt: null,
    plan: { cycle: "MONTHLY", id: "plan-id", status: "ACTIVE" },
    resolvedBy: null,
    status: "PENDING_PAYMENT",
    type: "DOWNGRADE",
    ...overrides,
  };
}

export function penaltyReport(
  overrides: Partial<PenaltyReport> = {},
): PenaltyReport {
  return {
    items: [
      penaltyReportItem(),
      penaltyReportItem({
        id: "paid-penalty-report-id",
        status: "PAID",
      }),
    ],
    summary: {
      overdueAmount: 0,
      paidAmount: 30,
      pendingAmount: 30,
      totalPenalties: 2,
      waivedAmount: 0,
    },
    ...overrides,
  };
}
