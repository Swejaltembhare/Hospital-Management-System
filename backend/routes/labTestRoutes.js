import express from 'express';
import {
  createLabTest,
  getAllLabTests,
  getLabTestById,
  getPatientLabTests,
  updateLabTestStatus,
  uploadLabResult,
} from '../controllers/labTestController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication on all diagnostic lab test routes
router.use(authenticate);

// Patient self-service lab test result endpoint
router.get('/my', getPatientLabTests);

// Diagnostic test order creation endpoint for medical staff
router.post('/', authorize('doctor', 'admin'), createLabTest);

// Admin and doctor lab test retrieval endpoints
router.get('/', authorize('admin', 'doctor'), getAllLabTests);
router.get('/:id', getLabTestById);

// Lab result data upload and status management endpoints
router.patch('/:id/status', authorize('admin', 'doctor'), updateLabTestStatus);
router.put('/:id/status', authorize('admin', 'doctor'), updateLabTestStatus);
router.patch('/:id/result', authorize('admin', 'doctor'), uploadLabResult);
router.put('/:id/result', authorize('admin', 'doctor'), uploadLabResult);

export default router;