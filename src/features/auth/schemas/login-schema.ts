import { z } from "zod";

export const loginSchema = z.object({
  userName: z.string().min(1, "Informe o nome de usuário."),
  password: z.string().min(1, "Informe a senha."),
});

export type LoginSchema = z.infer<typeof loginSchema>;
