// backend/routes/userRoutes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  validateUpdateUser, 
  validatePasswordChange 
} from '../middleware/validation.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Enforce authentication middleware across all user management routes
router.use(authenticate);

// Administrative user statistical metrics endpoint
router.get('/stats', authorize('admin'), userController.getUserStats);

// Administrative user collection query and batch control endpoints
router.get('/', authorize('admin'), userController.getAllUsers);
router.delete('/:id', authorize('admin'), userController.deleteUser);
router.patch('/:id/toggle-status', authorize('admin'), userController.toggleUserStatus);
router.post('/:id/reset-password', authorize('admin'), userController.resetPassword);

// Individual user profile retrieval, update, and password modification endpoints
router.get('/:id', userController.getUserById);
router.put('/:id', validateUpdateUser, userController.updateUser);
router.put('/:id/change-password', validatePasswordChange, userController.changePassword);
router.post('/:id/change-password', validatePasswordChange, userController.changePassword);

export default router;