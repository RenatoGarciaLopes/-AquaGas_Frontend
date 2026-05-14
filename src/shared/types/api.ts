// Envelope padrão de todos os endpoints do backend AquaGás
export type ApiResponse<T> = {
  data: T | null;
  error: {
    code: string;
    details?: Array<{ field: string; messages: string[] }>;
    message: string;
  } | null;
  success: boolean;
  timestamp: string;
};
