import { Worker } from "bullmq";

import { redisConnection } from "../config/redis.js";

import {
  getBookingByIdDao,
  expireBookingDao,
} from "../modules/booking/booking.dao.js";
import { BookingStatus } from "../../generated/prisma/enums.js";

new Worker(
  "booking-expiration",
  async (job) => {
    const booking = await getBookingByIdDao(
      job.data.bookingId,
    );

    if (!booking) {
      return;
    }

    if (booking.status !== BookingStatus.pending) {
      return;
    }

    await expireBookingDao({
      bookingId: booking.id,
      tierId: booking.tierId,
      quantity: booking.quantity,
    });
  },
  {
    connection: redisConnection,
  },
);