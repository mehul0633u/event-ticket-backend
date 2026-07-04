import { Router } from "express";
import { PERMISSIONS } from "../../constants/authorization.js";
import { auth } from "../../middlewares/auth.middleware.js";
import {
  paramsValidate,
  queryValidate,
  requestValidate,
} from "../../middlewares/validation.middleware.js";
import {
  createEventController,
  eventApproveRejectController,
  getEventByIdController,
  getEventsController,
  getMyEventController,
  getStatsByEventController,
} from "./event.controller.js";
import {
  createEventSchema,
  eventApproveRejectSchema,
  eventIdParamSchema,
  getEventsQuerySchema,
} from "./event.validation.js";

export const eventRouter = Router();

eventRouter.post(
  "/",
  auth(PERMISSIONS.EVENTS_CREATE),
  requestValidate(createEventSchema),
  createEventController,
);
eventRouter.get(
  "/my",
  auth(PERMISSIONS.EVENTS_SUBMIT_OWN),
  getMyEventController,
);
eventRouter.get(
  "/stats",
  auth(PERMISSIONS.EVENTS_READ_OWN),
  getStatsByEventController,
);
eventRouter.get("/", queryValidate(getEventsQuerySchema), getEventsController);
eventRouter.get(
  "/:id",
  paramsValidate(eventIdParamSchema),
  getEventByIdController,
);
eventRouter.patch(
  "/",
  auth(PERMISSIONS.EVENTS_REVIEW),
  requestValidate(eventApproveRejectSchema),
  eventApproveRejectController,
);
