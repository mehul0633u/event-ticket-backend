import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from "./env.js";

export const redisConnection = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD,
};
