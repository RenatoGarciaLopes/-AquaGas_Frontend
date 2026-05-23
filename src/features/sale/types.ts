export type SaleStatus = "Finished" | "Canceled" | number;
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
