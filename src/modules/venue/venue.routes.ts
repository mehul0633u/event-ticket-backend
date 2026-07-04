import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { requestValidate } from "../../middlewares/validation.middleware.js";
import {
  createVenueController,
  deleteVenueController,
  getVenuesController,
} from "./venue.controller.js";
import { PERMISSIONS } from "../../constants/authorization.js";
import { createVenueSchema } from "./venue.validation.js";

export const venueRouter = Router();

venueRouter.post(
  "/",
  auth(PERMISSIONS.VENUES_CREATE),
  requestValidate(createVenueSchema),
  createVenueController,
);
venueRouter.get("/", auth(), getVenuesController);
venueRouter.delete(
  "/:id",
  auth(PERMISSIONS.VENUES_DELETE),
  deleteVenueController,
);
