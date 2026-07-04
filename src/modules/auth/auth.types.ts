import type { z } from "zod";

import type { loginSchema, registerSchema } from "./auth.validation.js";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type ICreateUserInput = {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  roleId: string;
};