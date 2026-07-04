import {
  getTicketsController,
  ticketCheckInController,
} from "./ticket.controller.js";
import { Router } from "express";
import { PERMISSIONS } from "../../constants/authorization.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { requestValidate } from "../../middlewares/validation.middleware.js";
import { ticketCheckInSchema } from "./ticket.validation.js";

export const ticketRouter = Router();

ticketRouter.get(
  "/",
  auth(PERMISSIONS.BOOKINGS_READ_OWN),
  getTicketsController,
);

ticketRouter.patch(
  "/check-in",
  auth(PERMISSIONS.TICKETS_CHECK_IN_OWN),
  requestValidate(ticketCheckInSchema),
  ticketCheckInController,
);
