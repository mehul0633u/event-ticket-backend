import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant";
import {
  getUsersService,
  getUsersByIdService,
  changeStatusService,
  changeRoleService,
} from "./user.service.js";

export const getUsersController = async (req: Request, res: Response) => {
  const users = await getUsersService();

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.USER.USER_RETRIEVED_SUCCESS,
    data: users,
  });
};

export const getUsersByIdController = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await getUsersByIdService({ id });

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.USER.USER_RETRIEVED_SUCCESS,
    data: user,
  });
};

export const changeStatusController = async (req: Request, res: Response) => {
  const { isActive, id } = req.body;
  const normalizedIsActive = isActive === true || isActive === "true";

  const user = await changeStatusService({ isActive: normalizedIsActive, id });

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.USER.USER_STATUS_UPDATE_SUCCESS,
    data: user,
  });
};

export const changeRoleController = async (req: Request, res: Response) => {
  const { role, id } = req.body;

  const user = await changeRoleService({ role, id });

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.USER.USER_ROLE_UPDATE_SUCCESS,
    data: user,
  });
};
