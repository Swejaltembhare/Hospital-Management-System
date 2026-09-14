import express from 'express';
import {
  patientRegister,
  doctorRegister,
  patientLogin,
  doctorLogin,
  adminLogin,
  logout,
  updateProfile,
  changePassword,
  updateAppointmentSettings
} from "../controllers/authController.js";
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  validatePatientRegistration, 
  validateLogin 
} from '../middleware/validation.js';

const router = express.Router();

// Doctor and patient registration endpoints
router.post(
  "/doctor/register",
  authenticate,
  authorize("admin"),
  doctorRegister
);

router.post(
  "/patient/register",
  validatePatientRegistration,
  patientRegister
);

// User authentication login endpoints
router.post('/patient/login', validateLogin, patientLogin);
router.post('/doctor/login', validateLogin, doctorLogin);
router.post('/admin/login', validateLogin, adminLogin);

// Session termination endpoint
router.post('/logout', authenticate, logout);

// Profile management and account setting endpoints
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/appointment-settings', authenticate, authorize("doctor"), updateAppointmentSettings);

export default router;