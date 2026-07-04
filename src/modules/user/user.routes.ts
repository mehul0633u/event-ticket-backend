import { Router } from "express";
import { PERMISSIONS } from "../../constants/authorization.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { requestValidate } from "../../middlewares/validation.middleware.js";
import {
  changeStatusController,
  changeRoleController,
  getUsersByIdController,
  getUsersController,
} from "./user.controller.js";
import {
  changeRoleSchema,
  changeStatusSchema,
  getUsersByIdSchema,
} from "./user.validation.js";

export const userRouter = Router();

userRouter.get("/", auth(PERMISSIONS.USERS_READ), getUsersController);

userRouter.get(
  "/:id",
  auth(PERMISSIONS.USERS_READ),
  // requestValidate(getUsersByIdSchema),
  getUsersByIdController,
);

userRouter.post("/:id", auth(PERMISSIONS.USERS_READ), getUsersByIdController);

userRouter.patch(
  "/status",
  auth(PERMISSIONS.USERS_READ),
  requestValidate(changeStatusSchema),
  changeStatusController,
);

userRouter.patch(
  "/role",
  auth(PERMISSIONS.USERS_READ),
  requestValidate(changeRoleSchema),
  changeRoleController,
);
