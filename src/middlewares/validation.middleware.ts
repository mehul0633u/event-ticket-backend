import { Request, Response, NextFunction } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { z, ZodError } from "zod";
import { getLogger } from "../utils/logger.js";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../constants/constant.js";

const logger = getLogger("ValidateMiddleware");

export const requestValidate = <T extends z.ZodTypeAny>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug(`[VALIDATE] Validating request: ${req.method} ${req.path}`);

      // Check if body is undefined and Content-Type looks wrong
      if (
        req.body === undefined &&
        (req.method === "POST" ||
          req.method === "PUT" ||
          req.method === "PATCH")
      ) {
        const contentType = req.get("Content-Type") || "not set";
        logger.warn(
          `[VALIDATE] Request body is undefined. Possible cause: Content-Type is '${contentType}' instead of 'application/json'`,
          {
            path: req.path,
            method: req.method,
            contentType,
          },
        );
      }

      const validated = await schema.parseAsync(req.body);

      req.body = validated;
      Object.assign(req, validated);

      logger.debug("[VALIDATE] Validation passed", validated);

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const bodyUndefinedError = error.issues.some(
          (issue) => issue.path[0] === "body" && issue.code === "invalid_type",
        );
        const contentType = req.get("Content-Type") || "not set";

        logger.warn("[VALIDATE] Validation failed", {
          path: req.path,
          method: req.method,
          contentType: contentType,
          bodyDefined: req.body !== undefined,
          errors: error.issues,
        });

        const message = bodyUndefinedError
          ? `Request body is empty. Make sure Content-Type header is 'application/json' (found: '${contentType}')`
          : MESSAGES.COMMON.VALIDATION_FAILED;

        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message,
          error: {
            code: "VALIDATION_ERROR",
            details: error.issues.map((err) => ({
              field: err.path.join(".") || "unknown",
              message: err.message,
            })),
          },
        });
      }

      logger.error("[VALIDATE] Unexpected validation error", { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
        error: {
          code: "INTERNAL_SERVER_ERROR",
        },
      });
    }
  };
};

export const queryValidate = <T extends z.ZodTypeAny>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.validatedQuery = await schema.parseAsync(req.query);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.VALIDATION_FAILED,
          error: {
            code: "VALIDATION_ERROR",
            details: error.issues.map((issue) => ({
              field: issue.path.join(".") || "unknown",
              message: issue.message,
            })),
          },
        });
      }

      return next(error);
    }
  };
};

export const paramsValidate = <T extends z.ZodTypeAny>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = (await schema.parseAsync(req.params)) as ParamsDictionary;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.COMMON.VALIDATION_FAILED,
          error: {
            code: "VALIDATION_ERROR",
            details: error.issues.map((issue) => ({
              field: issue.path.join(".") || "unknown",
              message: issue.message,
            })),
          },
        });
      }

      return next(error);
    }
  };
};
