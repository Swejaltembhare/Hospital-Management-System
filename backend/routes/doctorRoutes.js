import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleCheck.js";
import {
  getDoctors,
  getDoctorById,
  getMyAppointments,
  updateAppointmentByDoctor,
} from "../controllers/doctorController.js";

const router = express.Router();

// public - patients browsing doctors
router.get("/", getDoctors);

// protected - doctor's own dashboard (must come BEFORE /:id to avoid route clash)
router.get("/me/appointments", protect, authorizeRoles("doctor"), getMyAppointments);
router.put("/appointments/:id", protect, authorizeRoles("doctor"), updateAppointmentByDoctor);

// public - single doctor detail
router.get("/:id", getDoctorById);

export default router;
