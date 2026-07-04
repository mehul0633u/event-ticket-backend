import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const bookingExpirationQueue = new Queue("booking-expiration", {
  connection: redisConnection,
});
