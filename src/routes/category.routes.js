import express from "express";
import { categoryController } from "../controllers/category.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

const { protect, authorizeRoles } = authMiddleware;

router
  .route("/")
  .post(protect, authorizeRoles("admin", "analyst"), categoryController.create)
  .get(protect, categoryController.getAll);

router
  .route("/:id")
  .delete(protect, authorizeRoles("admin"), categoryController.delete);

export default router;