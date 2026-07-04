import type { Response } from "express";

export type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
};

export type SuccessResponsePayload<T> = {
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ErrorResponsePayload = {
  statusCode: number;
  message: string;
  code: string;
  details?: unknown;
};

export const sendSuccess = <T>(
  res: Response,
  payload: SuccessResponsePayload<T>,
): Response<ApiResponse<T>> => {
  const body: ApiResponse<T> = {
    success: true,
    message: payload.message,
    data: payload.data,
    ...(payload.meta !== undefined && { meta: payload.meta }),
  };

  return res.status(payload.statusCode).json(body);
};

export const sendErrorResponse = (
  res: Response,
  payload: ErrorResponsePayload,
): Response<ApiErrorResponse> => {
  const body: ApiErrorResponse = {
    success: false,
    message: payload.message,
    error: {
      code: payload.code,
      ...(payload.details !== undefined && { details: payload.details }),
    },
  };

  return res.status(payload.statusCode).json(body);
};
