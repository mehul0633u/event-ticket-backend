import { Prisma } from "../../../generated/prisma/client";
import { StatusCodes } from "http-status-codes";
import {
  BookingStatus,
  PaymentStatus,
  RefundStatus,
  TicketStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../config/prisma";
import { MESSAGES } from "../../constants/constant";
import { apiError } from "../../utils/apiError";
import { ICreateRefundDaoInput, IRefund } from "./refund.types";
import { Refunds } from "razorpay/dist/types/refunds";

export const getBookingByIdDao = async (bookingId: string) => {
  return await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    select: {
      id: true,
      eventId: true,
      userId: true,
      event: {
        select: {
          startsAt: true,
        },
      },
      status: true,
      totalAmount: true,
      payments: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
};

export const createRefundDao = async ({
  bookingId,
  paymentId,
  reason,
  refundAmount,
  userId,
}: ICreateRefundDaoInput) => {
  return await prisma.refund.create({
    data: {
      paymentId,
      bookingId,
      requestedById: userId,
      refundAmount,
      reason,
    },
  });
};

export const getActiveRefundByBookingIdDao = async (bookingId: string) => {
  return await prisma.refund.findFirst({
    where: {
      bookingId,
      status: {
        in: [
          RefundStatus.pending,
          RefundStatus.approved,
          RefundStatus.processed,
        ],
      },
    },
  });
};

export const updateRefundDao = async (
  id: string,
  data: Prisma.RefundUpdateInput,
) => {
  return await prisma.refund.update({
    where: { id },
    data,
  });
};

export const getRefundDao = async (refundId: string) => {
  return await prisma.refund.findUnique({
    where: {
      id: refundId,
    },
    include: {
      booking: true,
      payment: true,
    },
  });
};

export const refundApproveDao = async (
  userId: string,
  refund: IRefund,
  razorpayRefund: Refunds.RazorpayRefund,
) => {
  return await prisma.$transaction(async (tx) => {
    const approvedRefund = await tx.refund.update({
      where: {
        id: refund.id,
      },
      data: {
        status: RefundStatus.processed,
        gatewayRefundId: razorpayRefund.id,
        approvedById: userId,
        processedAt: new Date(),
      },
    });
    await tx.booking.update({
      where: {
        id: refund.bookingId,
      },
      data: {
        status: BookingStatus.refunded,
      },
    });

    await tx.payment.update({
      where: {
        id: refund.paymentId,
      },
      data: {
        status: PaymentStatus.refunded,
      },
    });

    await tx.ticket.updateMany({
      where: {
        bookingId: refund.bookingId,
      },
      data: {
        status: TicketStatus.cancelled,
      },
    });

    const booking = await tx.booking.findUniqueOrThrow({
      where: {
        id: refund.bookingId,
      },
    });

    const tier = await tx.ticketTier.findUniqueOrThrow({
      where: {
        id: booking.tierId,
      },
    });

    if (tier.soldCount < booking.quantity) {
      throw apiError(
        StatusCodes.BAD_REQUEST,
        MESSAGES.REFUND.INVALID_INVENTORY_STATE,
      );
    }

    await tx.ticketTier.update({
      where: {
        id: booking.tierId,
      },
      data: {
        soldCount: {
          decrement: booking.quantity,
        },
      },
    });

    return approvedRefund;
  });
};

export const refundRejectDao = async (
  userId: string,
  refund: IRefund,
  reason: string,
) => {
  return await prisma.refund.update({
    where: {
      id: refund.id,
    },
    data: {
      status: RefundStatus.rejected,
      approvedById: userId,
      rejectionReason: reason,
      processedAt: new Date(),
    },
  });
};

export const getRefundsDao = async () => {
  return await prisma.refund.findMany({
    where: {
      status: RefundStatus.pending,
    },
    select: {
      id: true,
      refundAmount: true,
      reason: true,
      status: true,
      booking: {
        select: {
          id: true,
          event: {
            select: {
              title: true,
            },
          },
        },
      },
      requestedBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
};

export const getMyRefundDao = async (userId: string) => {
  return await prisma.refund.findMany({
    where: {
      requestedById: userId,
    },
    select: {
      id: true,
      refundAmount: true,
      reason: true,
      status: true,
      booking: {
        select: {
          id: true,
          event: {
            select: {
              title: true,
            },
          },
        },
      },
      requestedBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
};
