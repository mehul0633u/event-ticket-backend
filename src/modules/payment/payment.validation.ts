import { z } from "zod";

export const createPaymentSchema = z.object({
  bookingId: z.uuid(),
});

export const verifyPaymentSchema = z.object({
  bookingId: z.uuid(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});
