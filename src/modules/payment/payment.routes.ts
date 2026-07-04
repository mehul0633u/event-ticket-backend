import { Router } from "express";
import { PERMISSIONS } from "../../constants/authorization.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { requestValidate } from "../../middlewares/validation.middleware.js";
import {
  createPaymentController,
  verifyPaymentController,
} from "./payment.controller.js";
import {
  createPaymentSchema,
  verifyPaymentSchema,
} from "./payment.validation.js";

export const paymentRouter = Router();

paymentRouter.post(
  "/",
  auth(PERMISSIONS.PAYMENTS_READ_OWN),
  requestValidate(createPaymentSchema),
  createPaymentController,
);

paymentRouter.post(
  "/verify",
  auth(PERMISSIONS.PAYMENTS_READ_OWN),
  requestValidate(verifyPaymentSchema),
  verifyPaymentController,
);
