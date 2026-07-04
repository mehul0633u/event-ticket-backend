import { Prisma } from "../../../generated/prisma/client";

export interface IRefundRequestServiceInput {
  bookingId: string;
  reason: string;
  userId: string;
}

export interface ICreateRefundDaoInput {
  bookingId: string;
  paymentId: string;
  reason: string;
  refundAmount: number;
  userId: string;
}

export type IRefund = Prisma.RefundGetPayload<{
  include: {
    booking: true;
    payment: true;
  };
}>;
