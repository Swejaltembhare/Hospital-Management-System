// controllers/authController.js
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Admin from "../models/Admin.js";
import { generateToken, logUserActivity } from "../utils/authHelpers.js";

// Patient Registration
export const patientRegister = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    const user = new User({
      fullName,
      email,
      password,
      phoneNumber,
      role: "patient",
    });
    await user.save();

    const patient = new Patient({
      user: user._id,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
    });
    await patient.save();

    const token = generateToken(user._id);
    await logUserActivity(user._id, "REGISTER", { role: "patient" });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        patient: patient,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed",
    });
  }
};

// Patient Login
export const patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "patient" }).select(
      "+password",
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Account is deactivated",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const patient = await Patient.findOne({ user: user._id });
    const token = generateToken(user._id);
    await logUserActivity(user._id, "LOGIN", { role: "patient" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        patient: patient,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
};

export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("========== DOCTOR LOGIN ==========");
    console.log("Email:", email);

    const user = await User.findOne({
      email,
      role: "doctor",
    }).select("+password");

    console.log("User Found:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Doctor not found",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    console.log("Password Match:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid password",
      });
    }

    const doctor = await Doctor.findOne({ user: user._id });

    console.log("Doctor Profile:", doctor);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: "Doctor profile not found",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        doctor,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    console.log("========== ADMIN LOGIN ==========");
    console.log("Request Body:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      role: "admin",
    }).select("+password");

    console.log("User Found:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    console.log("Entered Password:", password);
    console.log("Password Match:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    console.log("✅ Login Success");

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Account is deactivated",
      });
    }

    const admin = await Admin.findOne({ user: user._id });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// Logout
export const logout = async (req, res) => {
  try {
    if (req.user) {
      await logUserActivity(req.user._id, "LOGOUT", { role: req.user.role });
    }
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
};

export const doctorRegister = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      department,
      specialization,
      qualification,
      experience,
      consultationFee,
    } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }
    const user = new User({
      fullName,
      email,
      password,
      phoneNumber,
      role: "doctor",
    });

    await user.save();
    const doctor = new Doctor({
      user: user._id,
      department,
      specialization,
      qualification,
      experience,
      consultationFee,
    });

    await doctor.save();
    const token = generateToken(user._id);
    await logUserActivity(user._id, "REGISTER", { role: "doctor" });
    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        doctor,
      },
    });
  } catch (error) {
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// controllers/authController.js

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user._id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another account",
        });
      }
    }

    const updateData = {};
    if (name) updateData.fullName = name;
    if (phone) updateData.phoneNumber = phone;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Get user with password
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
};

export const updateAppointmentSettings = async (req, res) => {
  try {
    const { consultationDuration, autoApprove } = req.body;
    if (
      consultationDuration &&
      (consultationDuration < 15 || consultationDuration > 120)
    ) {
      return res.status(400).json({
        success: false,
        message: "Consultation duration must be between 15 and 120 minutes",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment settings updated successfully",
      data: {
        consultationDuration: consultationDuration || 30,
        autoApprove: autoApprove !== undefined ? autoApprove : true,
      },
    });
  } catch (error) {
    console.error("Update appointment settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment settings",
      error: error.message,
    });
  }
};
