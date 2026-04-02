import express from "express";
import { recordController } from "../controllers/record.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

const { protect, authorizeRoles } = authMiddleware;

router
  .route("/")
  .get(protect, recordController.getAll)
  .post(protect, authorizeRoles("admin", "analyst"), recordController.create);

router
  .route("/:id")
  .get(protect, recordController.getOne)
  .patch(protect, authorizeRoles("admin", "analyst"), recordController.update)
  .delete(protect, authorizeRoles("admin"), recordController.delete);

export default router;