import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import type {
  ICreateEventServiceInput,
  IGetEventByIdServiceInput,
  IGetEventsServiceInput,
} from "./event.types.js";
import {
  createEventService,
  getEventByIdService,
  getEventsService,
  getMyEventService,
  getStatsByEventService,
  eventApproveRejectService,
} from "./event.service.js";

export const createEventController = async (req: Request, res: Response) => {
  const {
    title,
    description,
    bannerUrl,
    categoryId,
    venueId,
    startsAt,
    endsAt,
  } = req.body;
  const organizerId = req.userId as string;

  const eventInput: ICreateEventServiceInput = {
    title,
    description,
    bannerUrl,
    categoryId,
    venueId,
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    organizerId,
  };

  const event = await createEventService(eventInput);

  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.EVENT.EVENT_CREATED_SUCCESS,
    data: event,
  });
};

export const getEventsController = async (req: Request, res: Response) => {
  const { page, limit, search, categoryId, startDate, endDate, status } =
    req.validatedQuery as IGetEventsServiceInput;

  const eventsInput: IGetEventsServiceInput = {
    page,
    limit,
    search,
    categoryId,
    startDate,
    endDate,
    status,
  };

  const result = await getEventsService(eventsInput);

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.EVENT.EVENTS_RETRIEVED_SUCCESS,
    data: result.events,
    meta: result.meta,
  });
};

export const getEventByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;

  const eventByIdInput: IGetEventByIdServiceInput = {
    id: id as string,
  };

  const event = await getEventByIdService(eventByIdInput);

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.EVENT.EVENT_RETRIEVED_SUCCESS,
    data: event,
  });
};

export const getMyEventController = async (req: Request, res: Response) => {
  const organizerId = req.userId as string;

  const events = await getMyEventService(organizerId);

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.EVENT.EVENTS_RETRIEVED_SUCCESS,
    data: events,
  });
};

export const getStatsByEventController = async (
  req: Request,
  res: Response,
) => {
  const eventId = req.query.eventId as string;
  const organizerId = req.userId as string;

  const stats = await getStatsByEventService(eventId, organizerId);

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.COMMON.DATA_RETRIVED_SUCCESS,
    data: stats,
  });
};

export const eventApproveRejectController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userId as string;
  const { eventId, status, reason } = req.body;
  const event = await eventApproveRejectService({
    userId,
    eventId,
    status,
    reason,
  });

  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.EVENT.EVENT_UPDATED_SUCCESS,
    data: event,
  });
};
