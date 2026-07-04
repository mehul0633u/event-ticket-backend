import { Router } from "express";

import { PERMISSIONS } from "../../constants/authorization.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { uploadEventBannerController } from "./upload.controller.js";
import { uploadEventBannerMiddleware } from "./upload.middleware.js";

export const uploadRouter = Router();

uploadRouter.post(
  "/event-banner",
  auth(PERMISSIONS.EVENTS_CREATE),
  uploadEventBannerMiddleware,
  uploadEventBannerController,
);
