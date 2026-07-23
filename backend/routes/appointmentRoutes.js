import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleCheck.js";
import {
  bookAppointment,
  getMyAppointmentsAsPatient,
  cancelAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("patient"), bookAppointment);
router.get("/my", protect, authorizeRoles("patient"), getMyAppointmentsAsPatient);
router.put("/:id/cancel", protect, authorizeRoles("patient"), cancelAppointment);

export default router;
