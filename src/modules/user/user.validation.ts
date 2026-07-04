import { z } from "zod";

export const getUsersByIdSchema = z.object({
  id: z.string(),
});

export const changeStatusSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
});

export const changeRoleSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "organizer"]),
});
