import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getAllDoctors,
  getAvailableSlots,
} from "../controllers/doctorController.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("patient", "admin"),
  getAllDoctors
);

router.get(
  "/available-slots/:doctorId",
  authenticate,
  authorize("patient", "admin"),
  getAvailableSlots
);

export default router;