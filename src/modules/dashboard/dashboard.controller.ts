import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant";
import {
  adminDashboardService,
  organizerDashboardService,
  recentSaleService,
  revenueService,
} from "./dashboard.service.js";

export const adminDashboardController = async (req: Request, res: Response) => {
  const analytics = await adminDashboardService();

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.COMMON.DATA_RETRIVED_SUCCESS,
    data: analytics,
  });
};

export const organizerDashboardController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userId as string;
  const analytics = await organizerDashboardService(userId);

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.COMMON.DATA_RETRIVED_SUCCESS,
    data: analytics,
  });
};

export const recentSaleController = async (req: Request, res: Response) => {
  const userId = req.userId as string;

  const sale = await recentSaleService(userId);

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.COMMON.DATA_RETRIVED_SUCCESS,
    data: sale,
  });
};

export const revenueController = async (req: Request, res: Response) => {
  const revenue = await revenueService();

  sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.COMMON.DATA_RETRIVED_SUCCESS,
    data: revenue,
  });
};
