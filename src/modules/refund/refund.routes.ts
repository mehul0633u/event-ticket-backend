import { Router } from "express";
import { PERMISSIONS } from "../../constants/authorization.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { requestValidate } from "../../middlewares/validation.middleware.js";
import {
  getMyRefundController,
  getRefundController,
  refundApproveController,
  refundPreviewController,
  refundRejectController,
  refundRequestController,
} from "./refund.controller.js";
import {
  refundRejectSchema,
  refundRequestScema,
  refundStatusUpdateSchema,
} from "./refund.validation.js";

export const refundRouter = Router();

refundRouter.get(
  "/preview",
  auth(PERMISSIONS.REFUNDS_READ_OWN),
  refundPreviewController,
);

refundRouter.get("/", auth(PERMISSIONS.REFUNDS_MANAGE), getRefundController);
refundRouter.get("/my", auth(), getMyRefundController);

refundRouter.post(
  "/",
  auth(PERMISSIONS.REFUNDS_CREATE_OWN),
  requestValidate(refundRequestScema),
  refundRequestController,
);

refundRouter.patch(
  "/approved",
  auth(PERMISSIONS.REFUNDS_MANAGE),
  requestValidate(refundStatusUpdateSchema),
  refundApproveController,
);

refundRouter.patch(
  "/rejected",
  auth(PERMISSIONS.REFUNDS_MANAGE),
  requestValidate(refundRejectSchema),
  refundRejectController,
);
