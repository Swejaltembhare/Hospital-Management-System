import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleCheck.js";
import {
  createDepartment,
  getDepartments,
  deleteDepartment,
  createDoctor,
  getAllDoctorsAdmin,
  deleteDoctor,
  getAllAppointmentsAdmin,
  getDashboardStats,
} from "../controllers/adminController.js";

const router = express.Router();

// all admin routes require login + admin role
router.use(protect, authorizeRoles("admin"));

router.post("/departments", createDepartment);
router.get("/departments", getDepartments);
router.delete("/departments/:id", deleteDepartment);

router.post("/doctors", createDoctor);
router.get("/doctors", getAllDoctorsAdmin);
router.delete("/doctors/:id", deleteDoctor);

router.get("/appointments", getAllAppointmentsAdmin);
router.get("/stats", getDashboardStats);

export default router;
