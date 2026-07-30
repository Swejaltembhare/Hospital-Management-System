// controllers/adminController.js
import mongoose from "mongoose";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Admin from "../models/Admin.js";
import { logUserActivity } from "../utils/authHelpers.js";
import bcrypt from "bcryptjs";

// ============================================
// DOCTOR MANAGEMENT - CRUD Operations
// ============================================

// Get all doctors (with enhanced filtering)
export const getAllDoctors = async (req, res) => {
  try {
    const { search, department, isVerified, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let doctorQuery = Doctor.find(filter)
      .populate("user", "fullName email phoneNumber isActive")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
        role: "doctor",
      }).select("_id");

      const userIds = users.map((u) => u._id);
      doctorQuery = Doctor.find({
        ...filter,
        user: { $in: userIds },
      }).populate("user", "fullName email phoneNumber isActive");
    }

    const [doctors, total] = await Promise.all([
      doctorQuery,
      Doctor.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all doctors error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch doctors",
    });
  }
};

// Get single doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate(
      "user",
      "fullName email phoneNumber isActive",
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: "Doctor not found",
      });
    }

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("Get doctor error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch doctor",
    });
  }
};

// Create new doctor
export const createDoctor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      department,
      specialization,
      qualification,
      experience,
      consultationFee,
    } = req.body;
    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !password ||
      !department ||
      !specialization ||
      !qualification ||
      experience === undefined ||
      consultationFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Check if user is already a doctor
      const existingDoctor = await Doctor.findOne({ user: user._id });
      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: "User is already registered as a doctor",
        });
      }
    } else {
      // Create new user with doctor role
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        role: "doctor",
        isActive: true,
      });

      // Log user creation
      console.log(`Created new doctor user: ${email}`);
    }

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      department,
      specialization,
      qualification,
      experience: parseInt(experience),
      consultationFee: parseInt(consultationFee),
      isAvailable: true,
      isVerified: true,
    });

    // Populate user data
    await doctor.populate("user", "fullName email phoneNumber isActive");

    // Log activity
    await logUserActivity(req.userId, "CREATE_DOCTOR", {
      doctorId: doctor._id,
      email,
    });

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error creating doctor:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create doctor",
      error: error.message,
    });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      phoneNumber,
      department,
      specialization,
      qualification,
      experience,
      consultationFee,
      isAvailable,
      isVerified,
    } = req.body;

    // Find doctor
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Update user data if provided
    const userUpdate = {};
    if (fullName) userUpdate.fullName = fullName;
    if (email) userUpdate.email = email;
    if (phoneNumber) userUpdate.phoneNumber = phoneNumber;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(doctor.user, userUpdate, {
        new: true,
        runValidators: true,
      });
    }

    // Update doctor data
    const doctorUpdate = {};
    if (department) doctorUpdate.department = department;
    if (specialization) doctorUpdate.specialization = specialization;
    if (qualification) doctorUpdate.qualification = qualification;
    if (experience) doctorUpdate.experience = parseInt(experience);
    if (consultationFee)
      doctorUpdate.consultationFee = parseInt(consultationFee);
    if (isAvailable !== undefined) doctorUpdate.isAvailable = isAvailable;
    if (isVerified !== undefined) doctorUpdate.isVerified = isVerified;

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, doctorUpdate, {
      new: true,
      runValidators: true,
    }).populate("user", "fullName email phoneNumber isActive");

    // Log activity
    await logUserActivity(req.userId, "UPDATE_DOCTOR", {
      doctorId: id,
      updates: doctorUpdate,
    });

    res.json({
      success: true,
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if doctor has appointments
    const hasAppointments = await Appointment.exists({ doctor: id });
    if (hasAppointments) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete doctor with existing appointments. Archive instead.",
      });
    }

    // Delete user account
    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(id);

    // Log activity
    await logUserActivity(req.userId, "DELETE_DOCTOR", { doctorId: id });

    res.json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: error.message,
    });
  }
};

// ============================================
// PATIENT MANAGEMENT
// ============================================
export const getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let patientQuery = Patient.find()
      .populate("user", "fullName email phoneNumber isActive createdAt")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
        role: "patient",
      }).select("_id");

      const userIds = users.map((u) => u._id);
      patientQuery = Patient.find({
        user: { $in: userIds },
      }).populate("user", "fullName email phoneNumber isActive createdAt");
    }

    const [patients, total] = await Promise.all([
      patientQuery,
      Patient.countDocuments(),
    ]);

    res.json({
      success: true,
      data: patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all patients error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch patients",
    });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id)
      .populate("user", "fullName email phoneNumber isActive")
      .populate("medicalHistory.doctor", "specialization department");

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: "Patient not found",
      });
    }

    // Get appointments
    const appointments = await Appointment.find({ patient: id })
      .populate("doctor", "specialization department")
      .populate("doctor.user", "fullName")
      .sort({ date: -1 });

    res.json({
      success: true,
      data: {
        ...patient.toJSON(),
        appointments,
      },
    });
  } catch (error) {
    console.error("Get patient error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch patient",
    });
  }
};

// ============================================
// DASHBOARD
// ============================================
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      totalDepartments,
    ] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "cancelled" }),
      Doctor.distinct("department").then((depts) => depts.length),
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
        todayAppointments,
        completedAppointments,
        cancelledAppointments,
        totalDepartments,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard stats",
    });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const admin = await Admin.findOne({ user: req.userId });
    if (!admin) {
      return res.status(403).json({
        success: false,
        error: "Admin profile not found",
      });
    }

    const activities = admin.activityLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent activity",
    });
  }
};

// ============================================
// APPOINTMENT MANAGEMENT
// ============================================
export const getAllAppointments = async (req, res) => {
  try {
    const { status, date, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = new Date(date);

    const appointments = await Appointment.find(filter)
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "fullName email phoneNumber",
        },
      })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "fullName email",
        },
      })
      .sort({ date: -1, timeSlot: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch appointments",
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "fullName email phoneNumber",
        },
      })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "fullName email",
        },
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch appointment",
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "Appointment not found",
      });
    }

    await logUserActivity(req.userId, "UPDATE_APPOINTMENT", {
      appointmentId: req.params.id,
      status,
    });

    res.json({
      success: true,
      data: appointment,
      message: `Appointment ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update appointment",
    });
  }
};

// ============================================
// SYSTEM HEALTH
// ============================================
export const getSystemHealth = async (req, res) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    res.json({
      success: true,
      data: {
        server: "Running",
        database: dbStatus,
        api: "Operational",
        email: "Configured",
        storageUsage: "65%",
        cpuUsage: "32%",
        ramUsage: "45%",
        status: dbStatus === "Connected" ? "Healthy" : "Warning",
      },
    });
  } catch (error) {
    console.error("Error checking system health:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check system health",
    });
  }
};

// ============================================
// SETTINGS
// ============================================
let settingsCache = {
  hospitalName: "MediCare Hospital",
  hospitalAddress: "123 Healthcare Blvd, Medical District",
  phoneN: "+1 234 567 890",
  email: "info@medicare.com",
  workingHours: {
    start: "09:00",
    end: "18:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  consultationFee: {
    general: 500,
    specialist: 800,
    emergency: 1200,
  },
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    username: "noreply@medicare.com",
    password: "********",
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  theme: {
    primary: "#2563EB",
    secondary: "#10B981",
  },
};

export const getSettings = async (req, res) => {
  try {
    res.json({
      success: true,
      data: settingsCache,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch settings",
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    settingsCache = { ...settingsCache, ...req.body };

    await logUserActivity(req.userId, "UPDATE_SETTINGS", {
      settings: req.body,
    });

    res.json({
      success: true,
      data: settingsCache,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update settings",
    });
  }
};
