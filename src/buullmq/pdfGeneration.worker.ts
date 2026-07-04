// workers/pdfGeneration.worker.ts

import { Worker } from "bullmq";
import { prisma } from "../config/prisma.js";
import { redisConnection } from "../config/redis.js";
import { generateTicketPdf } from "../utils/pdf.js";
import { uploadPdfToCloudinary } from "../utils/cloudinary.js";

new Worker(
  "pdf-generation",
  async (job) => {
    const { ticketId } = job.data;
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        booking: {
          include: {
            event: {
              include: {
                venue: true,
              },
            },
            user: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (!ticket.qrCodeUrl) {
      throw new Error("QR not generated");
    }

    const pdfBuffer = await generateTicketPdf({
      ticketCode: ticket.ticketCode,
      bookingRef: ticket.booking.bookingRef,
      eventTitle: ticket.booking.event.title,
      userName: ticket.booking.user.fullName,
      venue: ticket.booking.event.venue?.name ?? "Venue Not Available",
      eventDate: ticket.booking.event.startsAt.toISOString(),
      qrCodeUrl: ticket.qrCodeUrl,
    });

    const pdfUrl = await uploadPdfToCloudinary(pdfBuffer, ticket.ticketCode);

    await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        pdfUrl,
      },
    });
  },
  {
    connection: redisConnection,
  },
);
