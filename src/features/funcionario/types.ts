export type FuncionarioStatus = "ATIVO" | "INATIVO" | string;

export type Funcionario = {
  cpf: string;
  createdAt: string;
  email?: null | string;
  id: string;
  name: string;
  phone?: null | string;
  status: FuncionarioStatus;
};

export type FuncionariosQuery = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sort?: string;
};

export type PaginatedFuncionarios = {
  data: Funcionario[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
