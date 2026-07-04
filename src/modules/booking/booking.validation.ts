import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z.uuid(),
  quantity:z.number().min(1),
  tierId: z.uuid()
});