// routes/analyticsRoutes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAppointmentTrend,
  getPatientRegistration,
  getDepartmentData,
  getAppointmentStatus,
  getDoctorPerformance
} from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/appointment-trend', getAppointmentTrend);
router.get('/patient-registration', getPatientRegistration);
router.get('/department-data', getDepartmentData);
router.get('/appointment-status', getAppointmentStatus);
router.get('/doctor-performance', getDoctorPerformance);

export default router;