// Espelha EmployeeWithUserResponse do backend (.NET)
export type UserResponse = {
  userId: string;
  userName: string;
  role: string; // "Manager" | "Employee" — normalizar via shared/auth/roles
};

export type EmployeeResponse = {
  id: string;
  name: string;
  cpf: string;
  email: string | null;
  phone: string | null;
  isActive?: boolean;
  createdAt?: string;
};

export type EmployeeWithUser = {
  user: UserResponse;
  employee: EmployeeResponse;
};

// Mutation inputs
export type RegisterEmployeeInput = {
  user: { userName: string; password: string; role: string };
  employee: { name: string; cpf: string; email: string; phone: string };
};

export type UpdateEmployeeInput = {
  name?: string;
  email?: string;
  phone?: string;
  userName?: string;
  newPassword?: string;
  role?: string;
};

// Paginação client-side (backend retorna lista plana sem paginação)
export type EmployeesQuery = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sort?: string;
};

export type PaginatedEmployees = {
  data: EmployeeWithUser[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
