import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const qrGenerationQueue = new Queue(
  "qr-generation",
  {
    connection: redisConnection,
  },
);