import { Router } from "express";
import { PERMISSIONS } from "../../constants/authorization.js";
import { auth } from "../../middlewares/auth.middleware.js";
import {
  adminDashboardController,
  organizerDashboardController,
  recentSaleController,
  revenueController,
} from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/admin",
  auth(PERMISSIONS.REVENUE_READ),
  adminDashboardController,
);

dashboardRouter.get(
  "/admin/revenue",
  auth(PERMISSIONS.REVENUE_READ),
  revenueController,
);

dashboardRouter.get(
  "/organizer",
  auth(PERMISSIONS.DASHBOARD_READ_OWN),
  organizerDashboardController,
);

dashboardRouter.get(
  "/organizer/recent-sales",
  auth(PERMISSIONS.DASHBOARD_READ_OWN),
  recentSaleController,
);
