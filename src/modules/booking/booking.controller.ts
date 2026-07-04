import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import {
  createBookingService,
  getMyBookingService,
  getBookingByIDService,
  getBookingByEventService,
} from "./booking.service.js";

export const createBookingController = async (req: Request, res: Response) => {
  const { eventId, quantity, tierId } = req.body;
  const userId = req.userId as string;
  const booking = await createBookingService({
    eventId,
    quantity,
    tierId,
    userId,
  });
  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.BOOKING.BOOKING_CREATED_SUCCESS,
    data: booking,
  });
};

export const getMyBookingController = async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const bookings = await getMyBookingService({ userId });
  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.BOOKING.BOOKINGS_RETRIEVED_SUCCESS,
    data: bookings,
  });
};

export const getBookingByEventController = async (
  req: Request,
  res: Response,
) => {
  const organizerId = req.userId as string;
  const eventId = req.query.eventId as string;
  const bookings = await getBookingByEventService({ organizerId, eventId });
  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.BOOKING.BOOKINGS_RETRIEVED_SUCCESS,
    data: bookings,
  });
};

export const getBookingByIDController = async (req: Request, res: Response) => {
  const bookingId = req.query.bookingId as string;
  const bookings = await getBookingByIDService({ bookingId });
  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.BOOKING.BOOKINGS_RETRIEVED_SUCCESS,
    data: bookings,
  });
};
