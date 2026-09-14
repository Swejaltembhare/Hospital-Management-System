// middleware/auth.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==========================================
// AUTHENTICATE USER
// ==========================================
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "No valid Bearer token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "No token provided",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        error: "Server configuration error",
        message: "JWT_SECRET is not configured",
      });
    }

    // ==========================================
    // VERIFY TOKEN
    // ==========================================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT:", decoded);

    // Support userId / id / _id
    const userId =
      decoded.userId ||
      decoded.id ||
      decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "User ID is missing from token",
      });
    }

    // ==========================================
    // FIND USER
    // ==========================================
    const user = await User.findById(userId).select("-password");

    if (!user) {
      console.log("User not found for ID:", userId);

      return res.status(401).json({
        success: false,
        error: "Authentication failed",
        message: "User not found",
      });
    }

    // ==========================================
    // CHECK ACTIVE STATUS
    // ==========================================
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        error: "Account disabled",
        message: "Your account has been deactivated",
      });
    }

    // ==========================================
    // ATTACH USER TO REQUEST
    // ==========================================
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    console.log("Authenticated user:", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    next();

  } catch (error) {

    // ==========================================
    // TOKEN EXPIRED
    // ==========================================
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        message: "Your session has expired. Please login again.",
      });
    }

    // ==========================================
    // INVALID TOKEN
    // ==========================================
    if (error.name === "JsonWebTokenError") {
      console.error("JWT verification failed:", error.message);

      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "Please login again",
      });
    }

    console.error("Auth middleware error:", error);

    return res.status(500).json({
      success: false,
      error: "Authentication error",
      message: "Something went wrong",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: `Role ${req.user.role} is not authorized for this action`,
      });
    }

    next();
  };
};

export const authorizePermissions = (...permissions) => {
  return async (req, res, next) => {
    try {

      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }

      const Admin = (
        await import("../models/Admin.js")
      ).default;

      const admin = await Admin.findOne({
        user: req.user._id,
      });

      if (!admin) {
        return res.status(403).json({
          success: false,
          error: "Admin profile not found",
        });
      }

      const adminPermissions = admin.permissions || [];

      const hasPermission = permissions.some(
        (permission) =>
          adminPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions",
          message:
            "You need additional permissions for this action",
        });
      }

      next();

    } catch (error) {
      console.error(
        "Permission check error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Permission check failed",
      });
    }
  };
};