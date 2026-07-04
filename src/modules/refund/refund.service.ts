import { StatusCodes } from "http-status-codes";
import { apiError } from "../../utils/apiError";
import {
  getBookingByIdDao,
  createRefundDao,
  getRefundDao,
  refundApproveDao,
  refundRejectDao,
  getRefundsDao,
  getMyRefundDao,
  getActiveRefundByBookingIdDao,
} from "./refund.dao.js";
import { IRefundRequestServiceInput } from "./refund.types";
import { MESSAGES } from "../../constants/constant";
import {
  BookingStatus,
  PaymentStatus,
  RefundStatus,
} from "../../../generated/prisma/enums";
import { createRefund } from "../../utils/razorpayRefund";

const calculateRefund = (amount: number, startsAt: Date) => {
  const now = new Date();

  const diffDays = Math.floor(
    (startsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays >= 30)
    return {
      refundPercentage: 90,
      refundAmount: amount * 0.9,
    };

  if (diffDays >= 15)
    return {
      refundPercentage: 75,
      refundAmount: amount * 0.75,
    };

  if (diffDays >= 7)
    return {
      refundPercentage: 50,
      refundAmount: amount * 0.5,
    };

  if (diffDays >= 1)
    return {
      refundPercentage: 25,
      refundAmount: amount * 0.25,
    };

  return {
    refundPercentage: 0,
    refundAmount: 0,
  };
};

export const refundRequestService = async ({
  bookingId,
  reason,
  userId,
}: IRefundRequestServiceInput) => {
  const booking = await getBookingByIdDao(bookingId);

  if (!booking) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.BOOKING.BOOKING_NOT_FOUND);
  }

  if (userId !== booking.userId) {
    throw apiError(StatusCodes.FORBIDDEN, MESSAGES.AUTH.ACCESS_DENIED);
  }

  if (booking.status !== BookingStatus.confirmed) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.BOOKING.BOOKING_NOT_DONE);
  }

  if (booking.event.startsAt < new Date()) {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.REFUND.REFUND_PERIOD_ENDED,
    );
  }

  const existingRefund = await getActiveRefundByBookingIdDao(bookingId);

  if (existingRefund) {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.REFUND.REFUND_ALREADY_EXISTS,
    );
  }

  const refundCalculate = calculateRefund(
    booking.totalAmount.toNumber(),
    booking.event.startsAt,
  );

  const payment = booking.payments.find(
    (payment) => payment.status === PaymentStatus.success,
  );

  if (!payment) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.PAYMENT.PAYMENT_NOT_SUCCESS);
  }
  const paymentId = payment.id;
  const refundAmount = refundCalculate.refundAmount;

  const refund = await createRefundDao({
    bookingId,
    paymentId,
    reason,
    refundAmount,
    userId,
  });

  return refund;
};

export const refundPreviewService = async ({
  bookingId,
  userId,
}: {
  bookingId: string;
  userId: string;
}) => {
  const booking = await getBookingByIdDao(bookingId);

  if (!booking) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.BOOKING.BOOKING_NOT_FOUND);
  }

  if (userId !== booking.userId) {
    throw apiError(StatusCodes.FORBIDDEN, MESSAGES.AUTH.ACCESS_DENIED);
  }

  const refund = calculateRefund(
    booking.totalAmount.toNumber(),
    booking.event.startsAt,
  );

  return {
    bookingAmount: booking.totalAmount,
    refundPercentage: refund.refundPercentage,
    refundAmount: refund.refundAmount,
  };
};

export const refundApproveService = async ({
  refundId,
  userId,
}: {
  refundId: string;
  userId: string;
}) => {
  const refund = await getRefundDao(refundId);

  if (!refund) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.REFUND.REFUND_NOT_FOUND);
  }
  if (refund.status !== RefundStatus.pending) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.REFUND.REFUND_PROCCESSED);
  }

  if (!refund.payment.gatewayPaymentId) {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.PAYMENT.PAYMENT_NOT_SUCCESS,
    );
  }
  const refundAmount = refund.refundAmount.toNumber();
  if (refundAmount <= 0) {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.REFUND.REFUND_PERIOD_ENDED,
    );
  }

  const razorpayRefund = await createRefund(
    refund.payment.gatewayPaymentId,
    Number(refund.refundAmount),
  );

  if (!razorpayRefund) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.REFUND.REFUND_FAILED);
  }

  const result = await refundApproveDao(userId, refund, razorpayRefund);

  return result;
};

export const refundRejectService = async ({
  refundId,
  reason,
  userId,
}: {
  refundId: string;
  reason: string;
  userId: string;
}) => {
  const refund = await getRefundDao(refundId);

  if (!refund) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.REFUND.REFUND_NOT_FOUND);
  }
  if (refund.status !== RefundStatus.pending) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.REFUND.REFUND_PROCCESSED);
  }

  const result = await refundRejectDao(userId, refund, reason);

  return result;
};

export const getRefundService = async () => {
  const refunds = await getRefundsDao();

  return refunds;
};

export const getMyRefundService = async (userId: string) => {
  const refunds = await getMyRefundDao(userId);

  return refunds;
};
