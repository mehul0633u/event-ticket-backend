import { Prisma } from "../../../generated/prisma/client";
import {
  BookingStatus,
  EventStatus,
  PaymentStatus,
  TicketStatus,
} from "../../../generated/prisma/enums";
import { Decimal } from "../../../generated/prisma/internal/prismaNamespace";
import { prisma } from "../../config/prisma";
import { ROLES } from "../../constants/authorization";

export const totalUserDao = async () => {
  return await prisma.user.count({
    where: {
      isActive: true,
      deletedAt: null,
      role: {
        title: {
          notIn: [ROLES.ADMIN],
        },
      },
    },
  });
};

export const totalEventDao = async () => {
  return await prisma.event.count({
    where: {
      deletedAt: null,
    },
  });
};

export const approvedEventDao = async () => {
  return await prisma.event.count({
    where: {
      status: EventStatus.approved,
      deletedAt: null,
    },
  });
};

export const pendingEventDao = async () => {
  return await prisma.event.count({
    where: {
      status: EventStatus.pending,
      deletedAt: null,
    },
  });
};

export const totalBookingDao = async () => {
  return await prisma.booking.count({
    where: {
      status: {
        in: [BookingStatus.confirmed, BookingStatus.refunded],
      },
    },
  });
};

export const totalRevenueDao = async (): Promise<Decimal> => {
  const result = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.success,
    },
  });

  return result._sum.amount ?? new Prisma.Decimal(0);
};

export const activeEventDao = async (userId: string) => {
  return await prisma.event.count({
    where: {
      organizerId: userId,
      deletedAt: null,
      status: EventStatus.approved,
      endsAt: {
        gte: new Date(),
      },
    },
  });
};

export const ticketsSoldDao = async (userId: string) => {
  const ticketsSold = await prisma.booking.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      status: {
        in: [BookingStatus.confirmed, BookingStatus.refunded],
      },
      event: {
        organizerId: userId,
      },
    },
  });
  return ticketsSold._sum.quantity ?? 0;
};

export const grossRevenueDao = async (userId: string) => {
  const grossRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.success,
      booking: {
        event: {
          organizerId: userId,
        },
      },
    },
  });
  return grossRevenue._sum.amount?.toNumber() ?? 0;
};

export const upcomingEventDao = async (userId: string) => {
  return await prisma.event.count({
    where: {
      organizerId: userId,
      status: EventStatus.approved,
      startsAt: {
        gt: new Date(),
      },
      deletedAt: null,
    },
  });
};

export const recentSaleDao = async (userId: string) => {
  return await prisma.booking.findMany({
    where: {
      status: BookingStatus.confirmed,

      event: {
        organizerId: userId,
      },
    },
    select: {
      bookingRef: true,
      totalAmount: true,
      createdAt: true,
      user: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
};

export const totalTicketsSoldDao = async () => {
  return await prisma.ticket.count();
};

export const recentPaymentDao = async () => {
  return await prisma.payment.findMany({
    select: {
      booking: {
        select: {
          bookingRef: true,
          event: {
            select: {
              title: true,
            },
          },
        },
      },
      amount: true,
    },
    orderBy: {
      paidAt: "desc",
    },
  });
};
