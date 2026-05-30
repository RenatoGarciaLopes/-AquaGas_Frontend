export type SaleStatus = "Finished" | "Canceled" | number;
export type SaleStatusFilter = "Finished" | "Canceled";

export type SalesQuery = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: SaleStatusFilter;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  sort?: string;
};

export type PaginatedSales = {
  data: SaleResponse[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type CancelSaleInput = {
  reason: string;
};

export type CancelSaleResponse = {
  saleId: string;
  status: SaleStatus;
  reason: string;
};
export type SaleProductType = "Water" | "Gas";
export type SaleCustomerDocumentType = "PF" | "PJ";

export type SaleProduct = {
  id: string;
  name: string;
  type: SaleProductType;
  price: number;
  quantity: number;
};

export type SaleCustomer = {
  id: string;
  name: string;
  document: string;
  typeDocument?: SaleCustomerDocumentType;
  phone?: string | null;
};

export type RegisterSaleItemInput = {
  productId: string;
  quantity: number;
};

export type RegisterSaleInput = {
  customerId?: string | null;
  discount?: number | null;
  saleItems: RegisterSaleItemInput[];
};

export type SaleCustomerResponse = {
  id: string;
  name: string;
  document: string;
};

export type SaleEmployeeResponse = {
  id: string;
  name: string;
};

export type SaleItemResponse = {
  productId: string;
  productName: string;
  quantity: number;
  total: number;
};

export type SaleResponse = {
  id: string;
  customer: SaleCustomerResponse | null;
  employee: SaleEmployeeResponse;
  items: SaleItemResponse[];
  subtotal: number;
  discount: number;
  total: number;
  status: SaleStatus;
  cancelReason: string | null;
  createdAt: string;
};
