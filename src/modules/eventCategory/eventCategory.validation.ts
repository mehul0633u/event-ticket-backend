import { z } from "zod";

export const createEventCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
});
