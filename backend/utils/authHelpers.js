// utils/authHelpers.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Generate JWT Token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const setupInitialAdmin = async () => {
  try {
    console.log("🔍 Checking for existing admin...");

    const adminExists = await User.findOne({ role: "admin" });

    console.log("Existing Admin:", adminExists);

    if (!adminExists) {
      console.log("✅ No admin found. Creating new admin...");

      const adminUser = new User({
        fullName: "System Administrator",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        phoneNumber: "1234567890",
        role: "admin",
        isActive: true,
        isEmailVerified: true,
      });

      await adminUser.save();

      const admin = new Admin({
        user: adminUser._id,
        isSuperAdmin: true,
        permissions: [
          "manage_users",
          "manage_doctors",
          "manage_patients",
          "manage_appointments",
          "view_reports",
          "manage_system",
          "manage_billing",
          "manage_medicines",
        ],
      });

      await admin.save();

      console.log("✅ Default admin created successfully");
      console.log("📧 Email:", adminUser.email);
    } else {
      console.log("⚠️ Admin already exists:", adminExists.email);
    }
  } catch (error) {
    console.error("❌ Admin setup error:", error);
  }
};

// Check user permissions
export const hasPermission = async (userId, requiredPermission) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') return false;

    const admin = await Admin.findOne({ user: userId });
    if (!admin) return false;

    return admin.permissions.includes(requiredPermission);
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

// Log user activity
export const logUserActivity = async (userId, action, details = {}) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        activityLog: {
          action,
          details,
          timestamp: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
};