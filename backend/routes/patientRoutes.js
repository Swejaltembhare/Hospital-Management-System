// routes/patientRoutes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as patientController from '../controllers/patientController.js';

const router = express.Router();

// All routes require authentication and patient role
router.use(authenticate);
router.use(authorize('patient'));
// Patient profile
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

// Appointments
router.post('/appointments', patientController.bookAppointment);
router.get('/appointments', patientController.getMyAppointments);
router.get('/appointments/:id', patientController.getAppointmentById);
router.put('/appointments/:id/cancel', patientController.cancelAppointment);

// Medical history
router.get('/medical-history', patientController.getMedicalHistory);
router.post('/medical-history', patientController.addMedicalHistory);

// Doctors (view only)
router.get('/doctors', patientController.getAvailableDoctors);
router.get('/doctors/:id', patientController.getDoctorDetails);

router.get("/medications", patientController.getMedications);
router.get("/health-score", patientController.getHealthScore);
router.get("/health-metrics", patientController.getHealthMetrics);
router.get("/emergency-contacts", patientController.getEmergencyContacts);
export default router;