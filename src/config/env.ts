import * as dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Environment variable ${key} is missing`);
  }
  return value;
};

const getOptionalEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value) {
    return undefined;
  }
  return value;
};

export const NODE_ENV = getEnv("NODE_ENV") || "development";
export const DATABASE_URL = getEnv("DATABASE_URL");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_ISSUER =
  getOptionalEnv("JWT_ISSUER") || "event-ticket-booking";
export const JWT_AUDIENCE =
  getOptionalEnv("JWT_AUDIENCE") || "event-ticket-booking-api";
export const JWT_ACCESS_EXPIRES = getOptionalEnv("JWT_ACCESS_EXPIRES") || "7d";
export const PORT = Number(getEnv("PORT") || 3000);
export const LOG_LEVEL =
  getEnv("LOG_LEVEL") || (NODE_ENV === "production" ? "info" : "debug");
export const SHOW_STACK_TRACE = getOptionalEnv("SHOW_STACK_TRACE") || "false";
export const CLOUDINARY_CLOUD_NAME = getEnv("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = getEnv("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = getEnv("CLOUDINARY_API_SECRET");
export const REDIS_HOST = getEnv("REDIS_HOST") || "localhost";
export const REDIS_PORT = getEnv("REDIS_PORT") || 6379;
export const REDIS_PASSWORD = undefined;
export const RAZORPAY_KEY_ID = getEnv("RAZORPAY_KEY_ID");
export const RAZORPAY_KEY_SECRET = getEnv("RAZORPAY_KEY_SECRET");
