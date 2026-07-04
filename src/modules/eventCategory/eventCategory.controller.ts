import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import {
  createEventCategoryService,
  getEventCategoriesService,
} from "./eventCategory.service.js";

export const createEventCategoryController = async (
  req: Request,
  res: Response,
) => {
  const category = await createEventCategoryService(req.body);

  return sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    message: MESSAGES.EVENT_CATEGORY.EVENT_CATEGORY_CREATED_SUCCESS,
    data: category,
  });
};

export const getEventCategoriesController = async (
  _req: Request,
  res: Response,
) => {
  const categories = await getEventCategoriesService();

  return sendSuccess(res, {
    statusCode: StatusCodes.OK,
    message: MESSAGES.EVENT_CATEGORY.EVENT_CATEGORIES_RETRIEVED_SUCCESS,
    data: categories,
  });
};
