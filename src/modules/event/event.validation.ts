import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z.string().trim().min(2).max(255),
    description: z.string().trim().min(1).optional(),
    bannerUrl: z.url().optional(),
    categoryId: z.uuid().optional(),
    venueId: z.uuid().optional(),
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

export const getEventsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().trim().min(1).optional(),
    categoryId: z.uuid().optional(),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    status: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      new Date(data.endDate) >= new Date(data.startDate),
    {
      message: "endDate must be greater than or equal to startDate",
      path: ["endDate"],
    },
  );

export const eventIdParamSchema = z.object({
  id: z.uuid(),
});

export const eventApproveRejectSchema = z.object({
  eventId: z.uuid(),
  status: z.string(),
  reason: z.string().optional(),
});
