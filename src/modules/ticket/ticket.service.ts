import { apiError } from "../../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import {
  getTicketDao,
  updateTicketDao,
  getTicketByIDDao,
} from "./ticket.dao.js";
import { ICheckInServiceInput } from "./ticket.types.js";
import { TicketStatus } from "../../../generated/prisma/enums.js";

export const getTicketService = async ({
  identifier,
}: {
  identifier: string;
}) => {
  const ticket = await getTicketDao({ identifier });

  return ticket;
};

export const ticketCheckInService = async ({
  ticketCode,
  userId,
}: ICheckInServiceInput) => {
  const identifier = ticketCode;
  const ticket = await getTicketDao({ identifier });

  if (!ticket) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.TICKET.TICKET_NOT_FOUND);
  }
  if (ticket.status === TicketStatus.used) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.TICKET.TICKET_USED);
  }
  if (ticket.status === TicketStatus.cancelled) {
    throw apiError(StatusCodes.BAD_REQUEST, MESSAGES.TICKET.TICKET_CANCELLED);
  }

  const data = {
    status: TicketStatus.used,
    checkedInAt: new Date(),
    checkedInById: userId,
  };

  const result = await updateTicketDao(ticket.id, data);

  return result;
};

export const getTicketByIDService = async ({
  ticketId,
}: {
  ticketId: string;
}) => {
  const tickets = getTicketByIDDao({ ticketId });

  return tickets;
};
