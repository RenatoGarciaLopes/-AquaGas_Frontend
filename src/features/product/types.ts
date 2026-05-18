export type ProductType = "Water" | "Gas";

export type ProductResponse = {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  quantity: number;
};

export type ProductsQuery = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  type?: ProductType;
  sort?: string;
};

export type PaginatedProducts = {
  data: ProductResponse[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
