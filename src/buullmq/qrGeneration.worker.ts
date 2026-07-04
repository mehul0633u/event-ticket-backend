import { Worker } from "bullmq";
import { prisma } from "../config/prisma.js";
import { generateQRBuffer } from "../utils/qr.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import { redisConnection } from "../config/redis.js";
import { pdfGenerationQueue } from "./pdfGeneration.queue.js";

new Worker(
  "qr-generation",
  async (job) => {
    const { ticketId, ticketCode } = job.data;

    const qrBuffer = await generateQRBuffer(ticketCode);

    const qrUrl = await uploadBufferToCloudinary(qrBuffer, ticketCode);

    await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        qrCodeUrl: qrUrl,
      },
    });
    await pdfGenerationQueue.add("generate-pdf", {
      ticketId,
    });
  },
  {
    connection: redisConnection,
  },
);
