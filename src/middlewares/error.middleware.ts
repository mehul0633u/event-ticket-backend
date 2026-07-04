import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { getLogger } from "../utils/logger.js";
import { sendErrorResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { SHOW_STACK_TRACE } from "../config/env.js";
import { MESSAGES } from "../constants/constant.js";

interface ExtendedError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

const logger = getLogger("ErrorMiddleware");

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let code = "INTERNAL_SERVER_ERROR";
  let message = MESSAGES.COMMON.INTERNAL_SERVER_ERROR;
  let details: unknown;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    code = "VALIDATION_ERROR";
    message = MESSAGES.COMMON.VALIDATION_FAILED;
    details = error.issues.map((issue) => ({
      field: issue.path.join(".") || "unknown",
      message: issue.message,
    }));
  } else if (error instanceof SyntaxError) {
    statusCode = StatusCodes.BAD_REQUEST;
    code = "INVALID_JSON";
    message = MESSAGES.COMMON.INVALID_JSON_PAYLOAD;
    details = error.message;
  } else if (error instanceof Error) {
    const typedError = error as ExtendedError;

    message = typedError.message || message;

    if (typedError.statusCode !== undefined) {
      statusCode = typedError.statusCode;
    }

    if (typedError.code !== undefined) {
      code = typedError.code;
    }

    if (typedError.details !== undefined) {
      details = typedError.details;
    }
  } else if (error && typeof error === "object") {
    // Custom error shapes like Razorpay SDK objects
    const obj = error as Record<string, unknown>;
    message = String(obj.message || obj.description || message);
    if (typeof obj.statusCode === "number") {
      statusCode = obj.statusCode === 401 ? StatusCodes.BAD_GATEWAY : obj.statusCode;
      code = obj.statusCode === 401 ? "BAD_GATEWAY" : code;
    }
  }

  const errorStack = error instanceof Error 
    ? error.stack 
    : (error as any)?.stack || (error as any)?.message || JSON.stringify(error);

  logger.error(`[ERROR] ${message}`, {
    path: req.path,
    method: req.method,
    statusCode,
    code,
    stack: errorStack,
    rawError: error,
    body: req.body,
    userId: req.userId,
  });

  const showStackTrace = SHOW_STACK_TRACE === "true";

  const responseDetails = showStackTrace
    ? {
        stack: errorStack,
        rawError: error,
        path: req.path,
        timestamp: new Date().toISOString(),
        ...(details !== undefined ? { details } : {}),
      }
    : details;

  return sendErrorResponse(res, {
    statusCode,
    message,
    code,
    ...(responseDetails !== undefined && { details: responseDetails }),
  });
};
