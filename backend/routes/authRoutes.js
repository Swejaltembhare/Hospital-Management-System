// // routes/authRoutes.js
// console.log("Auth routes file path:", import.meta.url);
// import express from 'express';
// import {
//     patientRegister,
//     doctorRegister,
//     patientLogin,
//     doctorLogin,
//     adminLogin,
//     logout
// } from "../controllers/authController.js";
// import { authenticate, authorize } from '../middleware/auth.js';
// console.log("authRoutes loaded");
// import { 
//   validatePatientRegistration, 
//   validateLogin 
// } from '../middleware/validation.js';

// const router = express.Router();
// router.post(
//     "/doctor/register",
//     authenticate,
//     authorize("admin"),
//     doctorRegister
// );
// // Patient routes
// router.post(
//     "/patient/register",
//     validatePatientRegistration,
//     patientRegister
// );
// router.post('/patient/login', validateLogin, patientLogin);

// // Doctor route
// router.post('/doctor/login', validateLogin, doctorLogin);

// // Admin route
// router.post('/admin/login', validateLogin, adminLogin);

// // Logout route (protected)
// router.post('/logout', authenticate, logout);

// export default router;






// routes/authRoutes.js
console.log("Auth routes file path:", import.meta.url);
import express from 'express';
import {
    patientRegister,
    doctorRegister,
    patientLogin,
    doctorLogin,
    adminLogin,
    logout,
    // 👇 New controllers
    updateProfile,
    changePassword,
    updateAppointmentSettings
} from "../controllers/authController.js";
import { authenticate, authorize } from '../middleware/auth.js';
console.log("authRoutes loaded");
import { 
  validatePatientRegistration, 
  validateLogin 
} from '../middleware/validation.js';

const router = express.Router();

// ==================== REGISTRATION ====================
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

// ==================== LOGIN ====================
router.post('/patient/login', validateLogin, patientLogin);
router.post('/doctor/login', validateLogin, doctorLogin);
router.post('/admin/login', validateLogin, adminLogin);

// ==================== LOGOUT ====================
router.post('/logout', authenticate, logout);

// ==================== SETTINGS ENDPOINTS ====================
// Update Profile
router.put('/profile', authenticate, updateProfile);

// Change Password
router.put('/change-password', authenticate, changePassword);

// Update Appointment Settings
router.put('/appointment-settings', authenticate, updateAppointmentSettings);

export default router;