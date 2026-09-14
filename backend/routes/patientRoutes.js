// backend/routes/patientRoutes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as patientController from '../controllers/patientController.js';

const router = express.Router();

// Restrict all patient route endpoints to authenticated patient accounts
router.use(authenticate);
router.use(authorize('patient'));

// Patient profile management endpoints
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

// Appointment booking and management endpoints
router.post('/appointments', patientController.bookAppointment);
router.get('/appointments', patientController.getMyAppointments);
router.get('/appointments/:id', patientController.getAppointmentById);
router.patch('/appointments/:id/cancel', patientController.cancelAppointment);
router.put('/appointments/:id/cancel', patientController.cancelAppointment);
router.patch('/appointments/:id/rating', patientController.rateAppointment);
router.put('/appointments/:id/rating', patientController.rateAppointment);

// Patient medical history records endpoints
router.get('/medical-history', patientController.getMedicalHistory);
router.post('/medical-history', patientController.addMedicalHistory);

// Doctor directory and details lookup endpoints
router.get('/doctors', patientController.getAvailableDoctors);
router.get('/doctors/:id', patientController.getDoctorDetails);

// Patient health records, medications, and support ticket endpoints
router.get('/medications', patientController.getMedications);
router.get('/health-metrics', patientController.getHealthMetrics);
router.get('/emergency-contacts', patientController.getEmergencyContacts);
router.post('/support', patientController.sendSupportMessage);

export default router;