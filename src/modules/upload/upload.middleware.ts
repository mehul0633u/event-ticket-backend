import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import multer, { MulterError } from "multer";

import { MESSAGES } from "../../constants/constant.js";
import { apiError } from "../../utils/apiError.js";
import { eventBannerStorage } from "./upload.storage.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: eventBannerStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        apiError(
          StatusCodes.BAD_REQUEST,
          MESSAGES.UPLOAD.INVALID_FILE_TYPE,
          "INVALID_FILE_TYPE",
        ),
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadEventBannerMiddleware: RequestHandler = (req, res, next) => {
  upload.single("banner")(req, res, (error) => {
    if (error instanceof MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(
          apiError(
            StatusCodes.BAD_REQUEST,  
            MESSAGES.UPLOAD.FILE_TOO_LARGE,
            "FILE_TOO_LARGE",
          ),
        );
      }

      return next(
        apiError(
          StatusCodes.BAD_REQUEST,
          error.message,
          "UPLOAD_ERROR",
        ),
      );
    }

    if (error) {
      return next(error);
    }

    if (!req.file) {
      return next(
        apiError(
          StatusCodes.BAD_REQUEST,
          MESSAGES.UPLOAD.BANNER_REQUIRED,
          "MISSING_FILE",
        ),
      );
    }

    return next();
  });
};
