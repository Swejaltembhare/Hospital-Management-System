import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as doctorController from '../controllers/doctorController.js';

const router = express.Router();

// Restrict all doctor route endpoints to authenticated doctor accounts
router.use(authenticate);
router.use(authorize('doctor'));

// Doctor profile management endpoints
router.get('/profile', doctorController.getProfile);
router.put('/profile', doctorController.updateProfile);

// Working hours and time slot availability endpoints
router.get('/availability', doctorController.getAvailability);
router.put('/availability', doctorController.updateAvailability);

// Appointment management endpoints
router.get('/appointments', doctorController.getMyAppointments);
router.get('/appointments/:id', doctorController.getAppointmentDetails);
router.patch('/appointments/:id/status', doctorController.updateAppointmentStatus);
router.put('/appointments/:id/status', doctorController.updateAppointmentStatus);

// Patient record access endpoints
router.get('/patients', doctorController.getMyPatients);
router.get('/patients/:id', doctorController.getPatientDetails);

// Patient rating and review overview endpoint
router.get('/ratings', doctorController.getMyRatings);

export default router;