import { Decimal } from "@prisma/client/runtime/client";
import { BookingStatus } from "../../../generated/prisma/enums.js";

export interface IAddReservedCountDaoInput {
  tierId: string;
  quantity: number;
}

export interface ICreateBookingInput extends IAddReservedCountDaoInput {
  eventId: string;
  userId: string;
}

export interface ICreateBookingDaoInput extends ICreateBookingInput {
  totalAmount: number;
  bookingRef: string;
  reservedUntil: Date;
}

export interface IExpireBookingDaoInput extends IAddReservedCountDaoInput {
  bookingId: string;
}

export interface IGetTierDaoResponse {
  id: string;
  name: string;
  price: Decimal;
  totalQuantity: number;
  soldCount: number;
  reservedCount: number;
  maxPerUser: number;
}

export interface ICreateBookingDaoResponse {
  id: string;
  eventId: string;
  currency: string;
  tierId: string;
  quantity: number;
  userId: string;
  totalAmount: Decimal;
  bookingRef: string;
  reservedUntil: Date | null;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetBookingByEventServiceInput {
  organizerId: string;
  eventId: string;
}
