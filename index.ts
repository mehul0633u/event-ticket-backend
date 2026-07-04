import cors from "cors";
import express from "express";
import { StatusCodes } from "http-status-codes";
import { NODE_ENV, PORT } from "./src/config/env.js";
import { MESSAGES } from "./src/constants/constant.js";
import { modulesRoutes } from "./src/router.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";
import "./src/buullmq/bookingExpiration.worker.js";
import "./src/buullmq/qrGeneration.worker.js";
import "./src/buullmq/pdfGeneration.worker.js";

const app = express();

// MIDDLEWARE
app.use(cors());

// Parse JSON requests
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(StatusCodes.OK).json({
    message: MESSAGES.HEALTH.API_RUNNING,
    version: "1.0.0",
    environment: NODE_ENV,
  });
});

app.use("/api/v1", modulesRoutes);

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
});
