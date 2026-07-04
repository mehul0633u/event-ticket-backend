import { z } from "zod";

export const createVenueSchema = z.object({
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(100),
});
