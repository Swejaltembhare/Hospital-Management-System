import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAuditLogs,
  getAuditLogById,
  getAuditLogStats,
  cleanupOldLogs,
} from '../controllers/auditLogController.js';

const router = express.Router();

// Enforce authentication and admin privileges across audit log endpoints
router.use(authenticate);
router.use(authorize('admin'));

// Audit log statistical metrics endpoint
router.get('/stats', getAuditLogStats);

// Paginated audit log retrieval endpoints
router.get('/', getAuditLogs);

// Delete historical audit logs (declared before parameter route to prevent route collision)
router.delete('/cleanup', cleanupOldLogs);

// Single audit log record lookup endpoint
router.get('/:id', getAuditLogById);

export default router;