import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { requestValidate } from "../../middlewares/validation.middleware.js";
import { PERMISSIONS } from "../../constants/authorization.js";
import {
  createTierController,
  listTiersController,
  getTierController,
  updateTierController,
  deactivateTierController,
} from "./ticketTier.controller.js";
import {
  createTierSchema,
  updateTierSchema,
} from "./ticketTier.validation.js";

export const ticketTierRouter = Router();

ticketTierRouter.post(
  "/events/:eventId/tiers",
  auth(PERMISSIONS.TICKET_TIERS_MANAGE_OWN),
  requestValidate(createTierSchema),
  createTierController,
);

ticketTierRouter.get(
  "/events/:eventId/tiers",
  auth(),
  listTiersController,
);

ticketTierRouter.get("/tiers/:tierId", auth(), getTierController);

ticketTierRouter.patch(
  "/tiers/:tierId",
  auth(PERMISSIONS.TICKET_TIERS_MANAGE_OWN),
  requestValidate(updateTierSchema),
  updateTierController,
);

ticketTierRouter.delete(
  "/tiers/:tierId",
  auth(PERMISSIONS.TICKET_TIERS_MANAGE_OWN),
  deactivateTierController,
);
