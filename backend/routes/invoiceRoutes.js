import express from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getPatientInvoices,
  updatePayment,
  updateInvoice,
  deleteInvoice,
  getInvoiceSummary,
} from '../controllers/invoiceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication on all billing invoice endpoints
router.use(authenticate);

// Patient self-service billing endpoints (placed before parameterized routes to avoid collision)
router.get('/my', getPatientInvoices);
router.get('/my/summary', getInvoiceSummary);
router.get('/my/:id', getInvoiceById);

// Administrative invoice creation and management endpoints
router.post('/', authorize('admin'), createInvoice);
router.get('/', authorize('admin'), getAllInvoices);
router.get('/:id', authorize('admin'), getInvoiceById);
router.put('/:id', authorize('admin'), updateInvoice);
router.delete('/:id', authorize('admin'), deleteInvoice);
router.patch('/:id/payment', authorize('admin'), updatePayment);

export default router;