import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import {
  getTicketService,
  ticketCheckInService,
  getTicketByIDService,
} from "./ticket.service.js";

export const getTicketsController = async (req: Request, res: Response) => {
  const identifier = req.query.identifier as string;
  const ticket = await getTicketService({ identifier });

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.TICKET.TICKET_RETRIEVED_SUCCESS,
    data: ticket,
  });
};

export const ticketCheckInController = async (req: Request, res: Response) => {
  const { ticketCode } = req.body;
  const userId = req.userId as string;

  const checkIn = await ticketCheckInService({ ticketCode, userId });

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.TICKET.TICKET_CHECK_IN_SUCCESS,
    data: checkIn,
  });
};

export const getTicketByIDController = async (req: Request, res: Response) => {
  const ticketId = req.params.ticketId as string;

  const tickets = await getTicketByIDService({ ticketId });

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.TICKET.TICKET_RETRIEVED_SUCCESS,
    data: tickets,
  });
};
