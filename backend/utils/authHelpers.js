import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Generate JSON Web Token for authenticated user sessions
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Hash raw password string with standard salt rounds
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Compare raw password against hashed password string
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Synchronize default system administrator user account during startup
export const setupInitialAdmin = async () => {
  try {
    const targetEmail = process.env.ADMIN_EMAIL || "swejaltembhare044@gmail.com";
    const rawPassword = process.env.ADMIN_PASSWORD || "@Liveheri";

    let adminUser = await User.findOne({ email: targetEmail });

    if (!adminUser) {
      adminUser = new User({
        fullName: "System Administrator",
        email: targetEmail,
        password: rawPassword,
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
      console.log("Default admin account created successfully");
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      await User.updateOne(
        { _id: adminUser._id },
        { 
          $set: { 
            password: hashedPassword,
            role: "admin",
            isActive: true 
          } 
        }
      );

      console.log("Admin credentials synced successfully for:", targetEmail);
    }
  } catch (error) {
    console.error("Admin setup error:", error);
  }
};

// Verify administrative user role permissions for system operations
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

// Record user activity event in user profile activity history
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