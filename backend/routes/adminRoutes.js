import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// Enforce authentication and administrative access controls on all admin routes
router.use(authenticate);
router.use(authorize("admin"));

// Administrative password reset override route
router.put("/users/:id/reset-password", adminController.resetUserPassword);

// Doctor management endpoints
router.get("/doctors", adminController.getAllDoctors);
router.get("/doctors/:id", adminController.getDoctorById);
router.post("/doctors", adminController.createDoctor);
router.put("/doctors/:id", adminController.updateDoctor);
router.delete("/doctors/:id", adminController.deleteDoctor);

// Patient profile and account management endpoints
router.get("/patients", adminController.getAllPatients);
router.get("/patients/:id", adminController.getPatientById);
router.post("/patients", adminController.createPatient);
router.put("/patients/:id", adminController.updatePatient);
router.delete("/patients/:id", adminController.deletePatient);

// Dashboard metric and system health monitoring endpoints
router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/stats", adminController.getDashboardStats);
router.get("/dashboard/recent-activity", adminController.getRecentActivity);
router.get("/recent-activity", adminController.getRecentActivity);
router.get("/system/health", adminController.getSystemHealth);
router.get("/system-health", adminController.getSystemHealth);

// Appointment oversight endpoints
router.get("/appointments", adminController.getAllAppointments);
router.get("/appointments/:id", adminController.getAppointmentById);
router.patch("/appointments/:id/status", adminController.updateAppointmentStatus);

// Billing and medical invoice management endpoints
router.get("/invoices", adminController.getAllInvoices);
router.post("/invoices", adminController.createInvoice);
router.patch("/invoices/:id/status", adminController.updateInvoiceStatus);

// Global system configuration settings endpoints
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);
router.put("/settings/password", adminController.changePassword);

// Patient helpdesk support ticket endpoints
router.get("/support-messages", adminController.getSupportMessages);
router.get("/support-messages/:id", adminController.getSupportMessageById);
router.patch("/support-messages/:id/status", adminController.updateSupportMessageStatus);
router.delete("/support-messages/:id", adminController.deleteSupportMessage);

// Admin notification dispatch endpoints
router.get("/notifications", adminController.getAdminNotifications);
router.patch("/notifications/mark-all-read", adminController.markAllNotificationsAsRead);
router.patch("/notifications/:id/read", adminController.markNotificationAsRead);

export default router;