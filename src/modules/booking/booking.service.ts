import {
  ICreateBookingInput,
  ICreateBookingDaoResponse,
  IGetBookingByEventServiceInput,
} from "./booking.types.js";
import {
  getTierDao,
  addReservedCountDao,
  createBookingDao,
  getMyBookingDao,
  getBookingByIdDao,
  getBookingByEventDao,
} from "./booking.dao.js";
import { apiError } from "../../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { bookingExpirationQueue } from "../../buullmq/bookingExpiration.queue.js";

import crypto from "node:crypto";

const generateBookingRef = async ({
  year,
}: {
  year: number;
}): Promise<string> => {
  // Pool excludes ambiguous characters: O, 0, I, 1, L, S, 5
  const pool = "ABCDEFGHJKMNPQRSTUVWXYZ2346789";
  const suffixLength = 5;
  let suffix = "";

  // Generate secure random bytes
  const randomBytes = crypto.randomBytes(suffixLength);

  for (let i = 0; i < suffixLength; i++) {
    // Map each byte to an index in our character pool
    const index = randomBytes[i] % pool.length;
    suffix += pool[index];
  }

  return `TKT-${year}-${suffix}`;
};

export const createBookingService = async ({
  eventId,
  quantity,
  tierId,
  userId,
}: ICreateBookingInput): Promise<ICreateBookingDaoResponse> => {
  const tier = await getTierDao(tierId);

  if (!tier) {
    throw apiError(
      StatusCodes.NOT_FOUND,
      MESSAGES.TICKET_TIER.TICKET_TIER_NOT_FOUND,
    );
  }
  if (tier.totalQuantity < quantity + tier.soldCount + tier.reservedCount) {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.BOOKING.INSUFFICIENT_TICKET_STOCK,
    );
  }

  const totalAmount = quantity * tier.price.toNumber();
  const reservedUntil = new Date(Date.now() + 15 * 60 * 1000);
  const bookingRef = await generateBookingRef({
    year: new Date().getFullYear(),
  });

  await addReservedCountDao({ tierId, quantity });

  const booking = await createBookingDao({
    userId,
    eventId,
    tierId,
    totalAmount,
    quantity,
    bookingRef,
    reservedUntil,
  });

  await bookingExpirationQueue.add(
    "expire-booking",
    {
      bookingId: booking.id,
    },
    {
      delay: 15 * 60 * 1000,
    },
  );

  return booking;
};

export const getMyBookingService = async ({ userId }: { userId: string }) => {
  const bookings = await getMyBookingDao({ userId });
  return bookings;
};

export const getBookingByIDService = async ({
  bookingId,
}: {
  bookingId: string;
}) => {
  const booking = await getBookingByIdDao(bookingId);
  return booking;
};

export const getBookingByEventService = async ({
  organizerId,
  eventId,
}: IGetBookingByEventServiceInput) => {
  const bookings = await getBookingByEventDao({ organizerId, eventId });
  return bookings.map((booking) => ({
    bookingRef: booking.bookingRef,
    customerName: booking.user.fullName,
    quantity: booking.quantity,
    status: booking.status,
    createdAt: booking.createdAt,
  }));
};
