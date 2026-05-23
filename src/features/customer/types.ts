export type CustomerDocumentType = "PF" | "PJ";

export type AddressResponse = {
  cep: string | null;
  city: string | null;
  complement: string | null;
  id: string;
  neighborhood: string | null;
  number: string | null;
  street: string | null;
};

export type CustomerResponse = {
  address: AddressResponse | null;
  document: string;
  email: string | null;
  id: string;
  name: string;
  phone: string | null;
  typeDocument: CustomerDocumentType;
};

export type RegisterCustomerInput = {
  address: {
    cep: string;
    city: string;
    complement: string | null;
    neighborhood: string;
    number: string;
    street: string;
  };
  document: string;
  email: string;
  name: string;
  phone: string;
};

export type CustomersQuery = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sort?: string;
  type?: CustomerDocumentType;
};

export type PaginatedCustomers = {
  data: CustomerResponse[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
