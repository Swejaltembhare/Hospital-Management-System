// routes/userRoutes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  validateUpdateUser, 
  validatePasswordChange 
} from '../middleware/validation.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/stats', authorize('admin'), userController.getUserStats);
router.get('/', authorize('admin'), userController.getAllUsers);
router.delete('/:id', authorize('admin'), userController.deleteUser);
router.patch('/:id/toggle-status', authorize('admin'), userController.toggleUserStatus);
router.post('/:id/reset-password', authorize('admin'), userController.resetPassword);

// User profile routes (admin or self)
router.get('/:id', userController.getUserById);
router.put('/:id', validateUpdateUser, userController.updateUser);
router.post('/:id/change-password', validatePasswordChange, userController.changePassword);

export default router;