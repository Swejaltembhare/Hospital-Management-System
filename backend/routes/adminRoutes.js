// // routes/adminRoutes.js
// import express from 'express';
// import { authenticate, authorize } from '../middleware/auth.js';
// import {
//   validateCreateDoctor,
//   validateUpdateDoctor
// } from "../middleware/validation.js";
// import * as adminController from '../controllers/adminController.js';

// const router = express.Router();

// // All routes require admin authentication
// router.use(authenticate);
// router.use(authorize('admin'));

// // ============================================
// // DOCTOR MANAGEMENT - CRUD Operations
// // ============================================

// // Get all doctors
// router.get('/doctors', adminController.getAllDoctors);

// // Get single doctor by ID
// router.get('/doctors/:id', adminController.getDoctorById);

// // Create new doctor
// router.post('/doctors', validateCreateDoctor, adminController.createDoctor);

// // Update doctor
// router.put(
//   "/doctors/:id",
//   validateUpdateDoctor,
//   adminController.updateDoctor
// );

// // Delete doctor
// router.delete('/doctors/:id', adminController.deleteDoctor);

// // ============================================
// // PATIENT MANAGEMENT
// // ============================================
// router.get('/patients', adminController.getAllPatients);
// router.get('/patients/:id', adminController.getPatientById);

// // ============================================
// // DASHBOARD
// // ============================================
// router.get('/dashboard/stats', adminController.getDashboardStats);
// router.get('/dashboard/recent-activity', adminController.getRecentActivity);

// // ============================================
// // APPOINTMENTS
// // ============================================
// router.get('/appointments', adminController.getAllAppointments);
// router.get('/appointments/:id', adminController.getAppointmentById);
// router.patch('/appointments/:id/status', adminController.updateAppointmentStatus);

// // ============================================
// // SYSTEM HEALTH
// // ============================================
// router.get('/system/health', adminController.getSystemHealth);

// // ============================================
// // SETTINGS
// // ============================================
// router.get('/settings', adminController.getSettings);
// router.put('/settings', adminController.updateSettings);

// export default router;




// routes/adminRoutes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  validateCreateDoctor,
  validateUpdateDoctor
} from "../middleware/validation.js";
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.get('/stats', adminController.getDashboardStats);

// ============================================
// PROTECTED ROUTES (Admin only)
// ============================================
router.use(authenticate);
router.use(authorize('admin'));

// DOCTOR MANAGEMENT
router.get('/doctors', adminController.getAllDoctors);
router.get('/doctors/:id', adminController.getDoctorById);
router.post('/doctors', validateCreateDoctor, adminController.createDoctor);
router.put('/doctors/:id', validateUpdateDoctor, adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

// PATIENT MANAGEMENT
router.get('/patients', adminController.getAllPatients);
router.get('/patients/:id', adminController.getPatientById);

// DASHBOARD
router.get('/dashboard/stats', adminController.getDashboardStats); // Keep for backward compatibility
router.get('/dashboard/recent-activity', adminController.getRecentActivity);

// APPOINTMENTS
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments/:id', adminController.getAppointmentById);
router.patch('/appointments/:id/status', adminController.updateAppointmentStatus);

// SYSTEM HEALTH
router.get('/system/health', adminController.getSystemHealth);

// SETTINGS
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

export default router;