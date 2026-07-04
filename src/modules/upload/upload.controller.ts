import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { MESSAGES } from "../../constants/constant.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { apiError } from "../../utils/apiError.js";

export const uploadEventBannerController = (
  req: Request,
  res: Response,
): void => {
  const file = req.file;

  if (!file?.path) {
    throw apiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      MESSAGES.UPLOAD.BANNER_UPLOAD_FAILED,
      "UPLOAD_FAILED",
    );
  }

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.UPLOAD.BANNER_UPLOAD_SUCCESS,
    data: {
      bannerUrl: file.path,
      publicId: file.filename,
    },
  });
};
