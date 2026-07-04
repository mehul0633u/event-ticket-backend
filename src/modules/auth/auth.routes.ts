import { Router } from "express";

import { auth } from "../../middlewares/auth.middleware.js";
import { requestValidate } from "../../middlewares/validation.middleware.js";
import {
  loginController,
  meController,
  registerController,
  updateMeController,
} from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  requestValidate(registerSchema),
  registerController,
);
authRouter.post("/login", requestValidate(loginSchema), loginController);
authRouter.get("/me", auth(), meController);
authRouter.patch("/me", auth(), updateMeController);
