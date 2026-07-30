// routes/doctorRoutes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as doctorController from '../controllers/doctorController.js';

const router = express.Router();

// All routes require authentication and doctor role
router.use(authenticate);
router.use(authorize('doctor'));

// Doctor profile
router.get('/profile', doctorController.getProfile);
router.put('/profile', doctorController.updateProfile);

// Availability management
router.get('/availability', doctorController.getAvailability);
router.put('/availability', doctorController.updateAvailability);

// Appointments
router.get('/appointments', doctorController.getMyAppointments);
router.get('/appointments/:id', doctorController.getAppointmentDetails);
router.put('/appointments/:id/status', doctorController.updateAppointmentStatus);

// Patient management (doctor view)
router.get('/patients', doctorController.getMyPatients);
router.get('/patients/:id', doctorController.getPatientDetails);

// Doctor ratings
router.get('/ratings', doctorController.getMyRatings);

export default router;