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

// Protect all analytical endpoints with authentication and admin authorization middleware
router.use(authenticate);
router.use(authorize('admin'));

// Hospital system analytics and performance metric endpoints
router.get('/appointment-trend', getAppointmentTrend);
router.get('/patient-registration', getPatientRegistration);
router.get('/department-data', getDepartmentData);
router.get('/appointment-status', getAppointmentStatus);
router.get('/doctor-performance', getDoctorPerformance);

export default router;