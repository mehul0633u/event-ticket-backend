import { Decimal } from "@prisma/client/runtime/client";

export interface ICreatePaymentServiceInput {
  bookingId: string;
  userId: string;
}

export interface ICreatePaymentDaoInput extends ICreatePaymentServiceInput {
  id: string;
  totalAmount: Decimal;
  currency: string;
}

interface IVerifyPayment {
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface IVerifyPaymentServiceInput extends IVerifyPayment {
  bookingId: string;
  userId: string;
  razorpayOrderId: string;
}

export interface IVerifyPaymentDaoInput extends IVerifyPayment {
  bId: string;
  id: string;
}
