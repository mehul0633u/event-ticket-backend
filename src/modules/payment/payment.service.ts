import {
  ICreatePaymentServiceInput,
  IVerifyPaymentServiceInput,
} from "./payment.types.js";
import { getBookingByIdDao } from "../booking/booking.dao.js";
import { apiError } from "../../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import {
  BookingStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";
import { razorpay } from "../../config/razorpay.js";
import {
  createPaymentDao,
  checkExistingPaymentDao,
  updatePaymentDao,
  checkExistingDao,
} from "./payment.dao.js";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../../config/env.js";
import crypto from "crypto";
import { qrGenerationQueue } from "../../buullmq/qrGeneration.queue.js";

export const createPaymentService = async ({
  bookingId,
  userId,
}: ICreatePaymentServiceInput) => {
  const booking = await getBookingByIdDao(bookingId);

  if (!booking) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.BOOKING.BOOKING_NOT_FOUND);
  }

  if (booking.status !== BookingStatus.pending) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.BOOKING.BOOKING_PROCESSED);
  }

  if (userId !== booking.userId) {
    throw apiError(StatusCodes.FORBIDDEN, MESSAGES.AUTH.ACCESS_DENIED);
  }

  if (booking.reservedUntil && booking.reservedUntil < new Date()) {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.BOOKING.RESERVATION_EXPIRED,
    );
  }

  const { totalAmount, currency } = booking;
  let payment, id;

  const existing = await checkExistingPaymentDao({ bookingId });

  if (!existing) {
    const order = await razorpay.orders.create({
      amount: Number(booking.totalAmount) * 100,
      currency: booking.currency,
      receipt: booking.bookingRef,
    });

    id = order.id;
    const { totalAmount, currency } = booking;
    payment = await createPaymentDao({
      bookingId,
      userId,
      id,
      totalAmount,
      currency,
    });
  } else {
    payment = existing;
    id = payment.gatewayOrderId;
  }

  return {
    orderId: id,
    amount: totalAmount,
    currency,
    key: RAZORPAY_KEY_ID,
    bookingId,
    payment,
  };
};

export const verifyPaymentService = async ({
  userId,
  bookingId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: IVerifyPaymentServiceInput) => {
  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.PAYMENT.PAYMENT_VERIFY_FAILED,
    );
  }

  const booking = await getBookingByIdDao(bookingId);
  if (!booking) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.BOOKING.BOOKING_NOT_FOUND);
  }

  if (userId !== booking.userId) {
    throw apiError(StatusCodes.FORBIDDEN, MESSAGES.AUTH.ACCESS_DENIED);
  }

  const existing = await checkExistingDao({ razorpayOrderId });

  if (!existing) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.PAYMENT.ORDERID_NOT_EXIST);
  }

  if (existing.status !== PaymentStatus.pending) {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.PAYMENT.PAYMENT_PAID_CANCELED,
    );
  }

  if (existing.bookingId !== bookingId) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.PAYMENT.PAYMENT_MISMATCH);
  }
  const id = existing.id;
  const bId = existing.bookingId;

  const result = await updatePaymentDao({
    bId,
    razorpayPaymentId,
    razorpaySignature,
    id,
  });

  for (const ticket of result.createdTickets) {
    await qrGenerationQueue.add("generate-qr", {
      ticketId: ticket.id,
      ticketCode: ticket.ticketCode,
    });
  }

  return result;
};
