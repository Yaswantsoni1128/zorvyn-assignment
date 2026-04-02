import express from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

const { protect } = authMiddleware;

router.get("/", protect, dashboardController.getSummary);

export default router;