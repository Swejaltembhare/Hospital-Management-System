// routes/authRoutes.js
console.log("Auth routes file path:", import.meta.url);
import express from 'express';
import {
    patientRegister,
    doctorRegister,
    patientLogin,
    doctorLogin,
    adminLogin,
    logout
} from "../controllers/authController.js";
import { authenticate, authorize } from '../middleware/auth.js';
console.log("authRoutes loaded");
import { 
  validatePatientRegistration, 
  validateLogin 
} from '../middleware/validation.js';

const router = express.Router();
router.post(
    "/doctor/register",
    authenticate,
    authorize("admin"),
    doctorRegister
);
// Patient routes
router.post(
    "/patient/register",
    validatePatientRegistration,
    patientRegister
);
router.post('/patient/login', validateLogin, patientLogin);

// Doctor route
router.post('/doctor/login', validateLogin, doctorLogin);

// Admin route
router.post('/admin/login', validateLogin, adminLogin);

// Logout route (protected)
router.post('/logout', authenticate, logout);

export default router;