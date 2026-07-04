import { Router } from "express";

import { authRouter } from "./modules/auth/auth.routes.js";
import { uploadRouter } from "./modules/upload/upload.routes.js";
import { venueRouter } from "./modules/venue/venue.routes.js";
import { eventRouter } from "./modules/event/event.routes.js";
import { eventCategoryRouter } from "./modules/eventCategory/eventCategory.routes.js";
import { ticketTierRouter } from "./modules/ticketTier/ticketTier.router.js";
import { bookingRouter } from "./modules/booking/booking.routes.js";
import { paymentRouter } from "./modules/payment/payment.routes.js";
import { ticketRouter } from "./modules/ticket/ticket.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import { refundRouter } from "./modules/refund/refund.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";

export const modulesRoutes = Router();

modulesRoutes.use("/auth", authRouter);
modulesRoutes.use("/uploads", uploadRouter);
modulesRoutes.use("/venues", venueRouter);
modulesRoutes.use("/events", eventRouter);
modulesRoutes.use("/event-categories", eventCategoryRouter);
modulesRoutes.use("/", ticketTierRouter);
modulesRoutes.use("/booking", bookingRouter);
modulesRoutes.use("/payment", paymentRouter);
modulesRoutes.use("/ticket", ticketRouter);
modulesRoutes.use("/users", userRouter);
modulesRoutes.use("/refund", refundRouter);
modulesRoutes.use("/dashboard", dashboardRouter);
