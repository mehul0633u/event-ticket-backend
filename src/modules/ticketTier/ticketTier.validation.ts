import { z } from "zod";

export const createTierSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  price: z.number().min(0).max(999999.99),
  currency: z.literal('INR').default('INR'),
  total_quantity: z.number().int().min(1).max(100000),
  max_per_user: z.number().int().min(1).max(20).default(5),
  sale_starts_at: z.string().datetime().optional(),
  sale_ends_at: z.string().datetime().optional(),
}).refine(data => {
  if (data.sale_starts_at && data.sale_ends_at) {
    return new Date(data.sale_starts_at) < new Date(data.sale_ends_at);
  }
  return true;
}, { message: 'sale_starts_at must be before sale_ends_at' });

export const updateTierSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  price: z.number().min(0).max(999999.99).optional(),
  total_quantity: z.number().int().min(1).optional(),
  max_per_user: z.number().int().min(1).max(20).optional(),
  sale_starts_at: z.string().datetime().optional(),
  sale_ends_at: z.string().datetime().optional(),
}).refine(data => {
  if (data.sale_starts_at && data.sale_ends_at) {
    return new Date(data.sale_starts_at) < new Date(data.sale_ends_at);
  }
  return true;
}, { message: 'sale_starts_at must be before sale_ends_at' });
