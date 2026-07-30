// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    console.log("Authorization:", req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication failed',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        error: 'Account disabled',
        message: 'Your account has been deactivated'
      });
    }

    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        message: 'Please login again'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication error',
      message: 'Something went wrong'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: `Role ${req.user.role} is not authorized for this action`
      });
    }
    next();
  };
};

export const authorizePermissions = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied' 
        });
      }

      const Admin = (await import('../models/Admin.js')).default;
      const admin = await Admin.findOne({ user: req.user._id });
      
      if (!admin) {
        return res.status(403).json({ 
          success: false,
          error: 'Admin profile not found' 
        });
      }

      const hasPermission = permissions.some(p => admin.permissions.includes(p));
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false,
          error: 'Insufficient permissions',
          message: 'You need additional permissions for this action'
        });
      }
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Permission check failed' 
      });
    }
  };
};