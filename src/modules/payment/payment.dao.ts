import { prisma } from "../../config/prisma.js";
import {
  ICreatePaymentDaoInput,
  IVerifyPaymentDaoInput,
} from "./payment.types.js";
import {
  BookingStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";
import { apiError } from "../../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { generateTicketCode } from "../../utils/ticket.js";

export const checkExistingPaymentDao = async ({
  bookingId,
}: {
  bookingId: string;
}) => {
  return await prisma.payment.findFirst({
    where: {
      bookingId,
      status: "pending",
    },
  });
};

export const createPaymentDao = async ({
  bookingId,
  userId,
  id,
  totalAmount,
  currency,
}: ICreatePaymentDaoInput) => {
  return await prisma.payment.create({
    data: {
      bookingId,
      userId,
      gatewayOrderId: id,
      amount: totalAmount,
      currency,
    },
  });
};

export const updatePaymentDao = async ({
  bId,
  razorpayPaymentId,
  razorpaySignature,
  id,
}: IVerifyPaymentDaoInput) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id },
      data: {
        gatewayPaymentId: razorpayPaymentId,
        gatewaySignature: razorpaySignature,
        status: PaymentStatus.success,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: {
        id: bId,
      },
      data: {
        status: BookingStatus.confirmed,
      },
    });

    const booking = await tx.booking.findFirst({
      where: { id: bId },
      select: {
        id: true,
        tierId: true,
        quantity: true,
        userId: true,
        totalAmount: true,
      },
    });

    if (!booking) {
      throw apiError(
        StatusCodes.BAD_REQUEST,
        MESSAGES.BOOKING.BOOKING_NOT_FOUND,
      );
    }

    await tx.ticketTier.update({
      where: {
        id: booking?.tierId,
      },
      data: {
        reservedCount: {
          decrement: booking?.quantity,
        },
        soldCount: {
          increment: booking?.quantity,
        },
      },
    });
    const ticketPrice = booking.totalAmount.div(booking.quantity);

    const tickets = Array.from({ length: booking.quantity }, () => ({
      bookingId: booking.id,
      userId: booking.userId,
      ticketCode: generateTicketCode(),
      pricePaid: ticketPrice,
    }));
    const createdTickets = await Promise.all(
      tickets.map((ticket) =>
        tx.ticket.create({
          data: ticket,
        }),
      ),
    );
    return {
      payment,
      createdTickets,
    };
  });
};

export const checkExistingDao = async ({
  razorpayOrderId,
}: {
  razorpayOrderId: string;
}) => {
  return await prisma.payment.findFirst({
    where: { gatewayOrderId: razorpayOrderId },
  });
};
