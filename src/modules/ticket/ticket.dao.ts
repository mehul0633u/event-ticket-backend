import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/prisma.js";
import { validate as isUUID } from "uuid";

export const createManyTicketDao = async (
  tx: Prisma.TransactionClient,
  data: {
    bookingId: string;
    userId: string;
    ticketCode: string;
    pricePaid: Prisma.Decimal;
  }[],
) => {
  return tx.ticket.createMany({
    data,
  });
};

export const getTicketDao = async ({ identifier }: { identifier: string }) => {
  return await prisma.ticket.findFirst({
    where: isUUID(identifier) ? { id: identifier } : { ticketCode: identifier },
    select: {
      id: true,
      ticketCode: true,
      status: true,
      pdfUrl: true,
      qrCodeUrl: true,
      pricePaid: true,
      checkedInAt: true,
      booking: {
        select: {
          id: true,
          event: {
            select: {
              title: true,
            },
          },
          tier: {
            select: {
              name: true,
            },
          },
          tickets: {
            select: {
              id: true,
              ticketCode: true,
            },
          },
        },
      },
    },
  });
};

export const updateTicketDao = async (
  id: string,
  data: Prisma.TicketUpdateInput,
) => {
  return await prisma.ticket.update({
    where: { id },
    data,
  });
};

export const getTicketByIDDao = async ({ ticketId }: { ticketId: string }) => {
  return await prisma.ticket.findMany({
    where: {
      id: ticketId,
    },
    select: {
      id: true,
      ticketCode: true,
      booking: {
        select: {
          event: {
            select: {
              title: true,
            },
          },
          tier: {
            select: {
              name: true,
            },
          },
        },
      },
      qrCodeUrl: true,
      pricePaid: true,
      status: true,
    },
  });
};
