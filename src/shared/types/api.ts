// Envelope padrão de todos os endpoints do backend AquaGás
export type ApiResponse<T> = {
  data: T | null;
  error: {
    code?: string;
    details?:
      | Array<{ field: string; message?: string[]; messages?: string[] }>
      | Record<string, string[]>;
    message: string;
  } | null;
  success: boolean;
  timestamp: string;
};
