import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { apiError } from "../../utils/apiError.js";
import {
  createEventDao,
  getEventByIdDao,
  getEventsDao,
  getMyEventDao,
  getEventStatsDao,
  totalBookingsDao,
  ticketsSoldDao,
  checkedInDao,
  refundCountDao,
  grossRevenueDao,
  refundAmountDao,
  eventApproveRejectDao,
} from "./event.dao.js";
import type {
  ICreateEventServiceInput,
  IEventApproveRejectServiceInput,
  IGetEventByIdServiceInput,
  IGetEventsServiceInput,
} from "./event.types.js";
import { EventStatus } from "../../../generated/prisma/enums.js";
import { stat } from "node:fs";

export const createEventService = (input: ICreateEventServiceInput) =>
  createEventDao(input);

export const getEventsService = (input: IGetEventsServiceInput) =>
  getEventsDao(input);

export const getEventByIdService = async ({
  id,
}: IGetEventByIdServiceInput) => {
  const event = await getEventByIdDao({ id });

  if (!event) {
    throw apiError(StatusCodes.NOT_FOUND, MESSAGES.EVENT.EVENT_NOT_FOUND);
  }

  return event;
};

export const getMyEventService = async (organizerId: string) => {
  const events = await getMyEventDao(organizerId);
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    status: event.status,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    venue: event.venue?.name,
    ticketsSold: event.bookings.reduce(
      (sum, booking) => sum + booking.quantity,
      0,
    ),
    revenue: event.bookings.reduce(
      (sum, booking) => sum + Number(booking.totalAmount),
      0,
    ),
  }));
};

export const getStatsByEventService = async (
  eventId: string,
  organizerId: string,
) => {
  const [
    event,
    totalBookings,
    ticketsSold,
    checkedIn,
    refundCount,
    grossRevenue,
    refundAmount,
  ] = await Promise.all([
    getEventStatsDao(eventId),
    totalBookingsDao(eventId),
    ticketsSoldDao(eventId),
    checkedInDao(eventId),
    refundCountDao(eventId),
    grossRevenueDao(eventId),
    refundAmountDao(eventId),
  ]);

  if (!event) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.EVENT.EVENT_NOT_FOUND);
  }

  if (event.organizerId !== organizerId) {
    throw apiError(StatusCodes.FORBIDDEN, MESSAGES.AUTH.ACCESS_DENIED);
  }

  return {
    eventId: event.id,
    eventTitle: event.title,
    totalBookings,
    ticketsSold,
    checkedIn,
    refundCount,
    grossRevenue: Number(grossRevenue),
    refundAmount: Number(refundAmount),
    netRevenue: Number(grossRevenue) - Number(refundAmount),
  };
};

export const eventApproveRejectService = async ({
  userId,
  eventId,
  status,
  reason,
}: IEventApproveRejectServiceInput) => {
  let result;
  if (status === EventStatus.approved) {
    const data = {
      userId,
      eventId,
      status,
    };
    result = await eventApproveRejectDao(data);
  } else if (status === EventStatus.rejected) {
    const data = {
      userId,
      eventId,
      status,
      reason,
    };
    result = await eventApproveRejectDao(data);
  } else {
    throw apiError(
      StatusCodes.BAD_REQUEST,
      MESSAGES.EVENT.EVENT_STATUS_NOT_ACCEPTABLE,
    );
  }
  return result;
};
