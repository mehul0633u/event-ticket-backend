import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { apiError } from "../../utils/apiError.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import {
  registerService,
  loginService,
  getProfileService,
  updateMeService,
} from "./auth.service.js";

export const registerController = async (req: Request, res: Response) => {
  const data = await registerService(req.body);
  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.AUTH.REGISTER_SUCCESS,
    data,
  });
};

export const loginController = async (req: Request, res: Response) => {
  const data = await loginService(req.body);
  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.AUTH.LOGIN_SUCCESS,
    data,
  });
};

export const meController = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw apiError(
      StatusCodes.UNAUTHORIZED,
      MESSAGES.AUTH.AUTHENTICATION_REQUIRED,
    );
  }

  const user = await getProfileService(req.userId);
  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.AUTH.PROFILE_RETRIEVED_SUCCESS,
    data: { user },
  });
};

export const updateMeController = async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const data = req.body;
  const user = await updateMeService(userId, data);

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.USER.USER_UPDATE_SUCCESS,
    data: user,
  });
};
