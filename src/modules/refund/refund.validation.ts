import { z } from "zod";

export const refundRequestScema = z.object({
  bookingId: z.uuid(),
  reason: z.string(),
});

export const refundStatusUpdateSchema = z.object({
  refundId: z.uuid(),
});

export const refundRejectSchema = z.object({
  refundId: z.uuid(),
  reason: z.string().trim().min(1),
});
