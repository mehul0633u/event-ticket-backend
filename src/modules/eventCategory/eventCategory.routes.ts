import { Router } from "express";
import { PERMISSIONS } from "../../constants/authorization.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { requestValidate } from "../../middlewares/validation.middleware.js";
import {
  createEventCategoryController,
  getEventCategoriesController,
} from "./eventCategory.controller.js";
import { createEventCategorySchema } from "./eventCategory.validation.js";

export const eventCategoryRouter = Router();

eventCategoryRouter.post(
  "/",
  auth(PERMISSIONS.EVENT_CATEGORIES_CREATE),
  requestValidate(createEventCategorySchema),
  createEventCategoryController,
);
eventCategoryRouter.get("/", getEventCategoriesController);
