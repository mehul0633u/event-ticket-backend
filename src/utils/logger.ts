import winston from "winston";

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const { combine, timestamp, errors, printf, colorize } = winston.format;

type LogMetadata = {
  moduleName?: string;
  requestId?: string;
  [key: string]: unknown;
};

const logFormat = printf(
  ({ timestamp, level, message, moduleName, requestId, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]`;

    if (moduleName) {
      log += ` [${moduleName}]`;
    }

    if (requestId) {
      log += ` [req:${requestId}]`;
    }

    log += ` : ${message}`;

    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }

    return log;
  },
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(
      colorize({
        all: true,
      }),
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      logFormat,
    ),
  }),

  new winston.transports.File({
    filename: "logs/combined.log",
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
  }),

  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
  }),
];

export const logger = winston.createLogger({
  level: LOG_LEVEL || "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    errors({
      stack: true,
    }),
    logFormat,
  ),
  transports,
});

/**
 * Create module-specific logger
 *
 * Example:
 * const log = getLogger("AuthMiddleware");
 */
export const getLogger = (moduleName: string) => {
  return logger.child({
    moduleName,
  });
};

/**
 * HTTP Request Logger Helper
 */
export const logHttpRequest = (
  log: winston.Logger,
  method: string,
  url: string,
  statusCode: number,
  message?: string,
  metadata?: Record<string, unknown>,
) => {
  const level =
    statusCode >= 500
      ? "error"
      : statusCode >= 400
        ? "warn"
        : "info";

  log.log(level, `${method} ${url} -> ${statusCode}${message ? ` ${message}` : ""}`, metadata);
};

export default logger;