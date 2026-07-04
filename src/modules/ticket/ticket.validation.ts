import { z } from "zod";

export const ticketCheckInSchema = z.object({
  ticketCode: z.string(),
});
