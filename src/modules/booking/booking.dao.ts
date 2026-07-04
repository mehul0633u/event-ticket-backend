import { prisma } from "../../config/prisma.js";
import {
  ICreateBookingDaoInput,
  IExpireBookingDaoInput,
  IGetTierDaoResponse,
  IAddReservedCountDaoInput,
  ICreateBookingDaoResponse,
  IGetBookingByEventServiceInput,
} from "./booking.types.js";
import { BookingStatus } from "../../../generated/prisma/enums.js";

export const getTierDao = async (
  tierId: string,
): Promise<IGetTierDaoResponse | null> => {
  return prisma.ticketTier.findUnique({
    where: {
      id: tierId,
    },
    select: {
      id: true,
      name: true,
      price: true,
      soldCount: true,
      reservedCount: true,
      totalQuantity: true,
      maxPerUser: true,
    },
  });
};

export const addReservedCountDao = async ({
  tierId,
  quantity,
}: IAddReservedCountDaoInput): Promise<void> => {
  await prisma.ticketTier.updateMany({
    where: {
      id: tierId,
    },
    data: {
      reservedCount: {
        increment: quantity,
      },
    },
  });
};

export const createBookingDao = async ({
  userId,
  eventId,
  tierId,
  totalAmount,
  quantity,
  bookingRef,
  reservedUntil,
}: ICreateBookingDaoInput): Promise<ICreateBookingDaoResponse> => {
  return prisma.booking.create({
    data: {
      userId,
      eventId,
      tierId,
      totalAmount,
      quantity,
      bookingRef,
      reservedUntil,
    },
  });
};

export const getBookingByIdDao = async (
  bookingId: string,
): Promise<ICreateBookingDaoResponse | null> => {
  return await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });
};

export const expireBookingDao = async ({
  bookingId,
  tierId,
  quantity,
}: IExpireBookingDaoInput): Promise<void> => {
  return prisma.$transaction(async (tx) => {
    await tx.ticketTier.update({
      where: {
        id: tierId,
      },
      data: {
        reservedCount: {
          decrement: quantity,
        },
      },
    });

    await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.expired,
      },
    });
  });
};

export const getMyBookingDao = async ({ userId }: { userId: string }) => {
  return await prisma.booking.findMany({
    where: {
      userId,
      status: {
        notIn: [BookingStatus.expired, BookingStatus.pending],
      },
    },
    select: {
      id: true,
      bookingRef: true,
      event: {
        select: {
          title: true,
        },
      },
      tickets: {
        select: {
          id: true,
          ticketCode: true,
        },
      },
      status: true,
      totalAmount: true,
      quantity: true,
    },
  });
};

export const getBookingByEventDao = async ({
  organizerId,
  eventId,
}: IGetBookingByEventServiceInput) => {
  return await prisma.booking.findMany({
    where: {
      eventId,
      event: {
        organizerId,
      },
    },
    select: {
      bookingRef: true,
      user: {
        select: {
          fullName: true,
        },
      },
      quantity: true,
      totalAmount: true,
      status: true,
      createdAt: true,
    },
  });
};
