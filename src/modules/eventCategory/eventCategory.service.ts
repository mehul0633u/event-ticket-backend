import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "../../constants/constant.js";
import { apiError } from "../../utils/apiError.js";
import {
  createEventCategoryDao,
  findEventCategoryByNameDao,
  getEventCategoriesDao,
} from "./eventCategory.dao.js";
import type { ICreateEventCategoryInput } from "./eventCategory.types.js";

export const createEventCategoryService = async (
  input: ICreateEventCategoryInput,
) => {
  const existingCategory = await findEventCategoryByNameDao(input.name);

  if (existingCategory) {
    throw apiError(
      StatusCodes.CONFLICT,
      MESSAGES.EVENT_CATEGORY.EVENT_CATEGORY_ALREADY_EXISTS,
    );
  }

  return createEventCategoryDao(input);
};

export const getEventCategoriesService = () => getEventCategoriesDao();
