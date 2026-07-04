import { prisma } from "../../config/prisma.js";
import type {
  ICreateEventDaoInput,
  IEventApproveRejectServiceInput,
  IGetEventByIdDaoInput,
  IGetEventsDaoInput,
  IGetEventsResult,
} from "./event.types.js";
import {
  BookingStatus,
  EventStatus,
  PaymentStatus,
  RefundStatus,
  TicketStatus,
} from "../../../generated/prisma/enums.js";
import type { Prisma } from "../../../generated/prisma/client.js";

const publicEventSelect = {
  id: true,
  title: true,
  description: true,
  bannerUrl: true,
  startsAt: true,
  endsAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  venue: {
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export const createEventDao = (input: ICreateEventDaoInput) =>
  prisma.event.create({
    data: {
      title: input.title,
      description: input.description,
      bannerUrl: input.bannerUrl,
      categoryId: input.categoryId,
      venueId: input.venueId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      organizerId: input.organizerId,
      status: EventStatus.pending,
    },
    select: publicEventSelect,
  });

type PublicEvent = Prisma.EventGetPayload<{ select: typeof publicEventSelect }>;

export const getEventsDao = async (
  input: IGetEventsDaoInput,
): Promise<IGetEventsResult<PublicEvent>> => {
  const { page, limit, search, categoryId, startDate, endDate, status } = input;
  const skip = (page - 1) * limit;

  const where: Prisma.EventWhereInput = {
    ...(status
      ? { status: status as EventStatus }
      : { status: EventStatus.approved }),
    deletedAt: null,
    ...(categoryId ? { categoryId } : {}),
    startsAt: {
      gte: startDate ? new Date(startDate) : new Date(), // Default to now
      ...(endDate ? { lte: new Date(endDate) } : {}),
    },
    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      select: publicEventSelect,
      orderBy: {
        startsAt: "asc",
      },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    events,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const getEventByIdDao = ({ id }: IGetEventByIdDaoInput) =>
  prisma.event.findFirst({
    where: {
      id,
      status: "approved",
      deletedAt: null,
    },
    select: publicEventSelect,
  });

export const getMyEventDao = async (organizerId: string) => {
  return await prisma.event.findMany({
    where: {
      organizerId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      startsAt: true,
      endsAt: true,
      venue: {
        select: {
          name: true,
        },
      },
      bookings: {
        where: {
          status: BookingStatus.confirmed,
        },
        select: {
          totalAmount: true,
          quantity: true,
        },
      },
    },
  });
};

export const getEventStatsDao = async (eventId: string) => {
  return prisma.event.findUnique({
    where: {
      id: eventId,
    },
    select: {
      id: true,
      title: true,
      organizerId: true,
    },
  });
};

export const totalBookingsDao = async (eventId: string) => {
  return prisma.booking.count({
    where: {
      eventId,
      status: BookingStatus.confirmed,
    },
  });
};

export const ticketsSoldDao = async (eventId: string) => {
  const tiers = await prisma.ticketTier.findMany({
    where: {
      eventId,
    },
    select: {
      soldCount: true,
    },
  });

  return tiers.reduce((sum, tier) => sum + tier.soldCount, 0);
};

export const checkedInDao = async (eventId: string) => {
  return prisma.ticket.count({
    where: {
      booking: {
        eventId,
      },
      status: TicketStatus.used,
    },
  });
};

export const refundCountDao = async (eventId: string) => {
  return prisma.refund.count({
    where: {
      booking: {
        eventId,
      },
      status: {
        in: [RefundStatus.approved, RefundStatus.processed],
      },
    },
  });
};

export const grossRevenueDao = async (eventId: string) => {
  const result = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      booking: {
        eventId,
      },
      status: PaymentStatus.success,
    },
  });

  return result._sum.amount ?? 0;
};

export const refundAmountDao = async (eventId: string) => {
  const result = await prisma.refund.aggregate({
    _sum: {
      refundAmount: true,
    },
    where: {
      booking: {
        eventId,
      },
      status: {
        in: [RefundStatus.approved, RefundStatus.processed],
      },
    },
  });

  return result._sum.refundAmount ?? 0;
};

export const eventApproveRejectDao = async (
  data: IEventApproveRejectServiceInput,
) => {
  const { userId, eventId, status, reason } = data;
  await prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      status,
      rejectionReason: reason,
      reviewedBy: userId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    },
  });
};
