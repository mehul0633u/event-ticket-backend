import { Router } from "express";
import { PERMISSIONS } from "../../constants/authorization.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { requestValidate } from "../../middlewares/validation.middleware.js";
import {
  createBookingController,
  getMyBookingController,
  getBookingByIDController,
  getBookingByEventController,
} from "./booking.controller.js";
import { createBookingSchema } from "./booking.validation.js";

export const bookingRouter = Router();

bookingRouter.post(
  "/",
  auth(PERMISSIONS.BOOKINGS_CREATE),
  requestValidate(createBookingSchema),
  createBookingController,
);

bookingRouter.get(
  "/my",
  auth(PERMISSIONS.BOOKINGS_CREATE),
  getMyBookingController,
);

bookingRouter.get(
  "/event",
  auth(PERMISSIONS.BOOKING_READ_EVENT),
  getBookingByEventController,
);

bookingRouter.get(
  "/",
  auth(PERMISSIONS.BOOKINGS_CREATE),
  getBookingByIDController,
);
