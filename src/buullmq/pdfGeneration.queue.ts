
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const pdfGenerationQueue =
  new Queue(
    "pdf-generation",
    {
      connection: redisConnection,
    }
  );