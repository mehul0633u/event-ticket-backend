export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = `HTTP_${statusCode}`,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiError = (
  statusCode: number,
  message: string,
  code?: string,
  details?: unknown,
): ApiError => new ApiError(statusCode, message, code, details);
