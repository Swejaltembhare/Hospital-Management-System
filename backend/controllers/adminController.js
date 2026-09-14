import mongoose from "mongoose";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Admin from "../models/Admin.js";
import { logUserActivity } from "../utils/authHelpers.js";
import { logAudit } from "../middleware/auditLog.js";
import SupportMessage from "../models/SupportMessage.js";
import bcrypt from "bcryptjs";

// Reset password for doctor or patient account by admin
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    let user = await User.findById(id);

    if (!user) {
      const doctorDoc = await Doctor.findById(id);
      if (doctorDoc) {
        user = await User.findById(doctorDoc.user);
      } else {
        const patientDoc = await Patient.findById(id);
        if (patientDoc) {
          user = await User.findById(patientDoc.user);
        }
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    if (req.userId) {
      await logUserActivity(req.userId, "ADMIN_RESET_USER_PASSWORD", {
        targetUserId: user._id,
        userRole: user.role,
      });

      await logAudit(
        req,
        "UPDATE",
        "USER",
        user._id,
        user.fullName,
        `Admin reset password for ${user.role}: ${user.fullName}`
      );
    }

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for ${user.fullName}`,
    });
  } catch (error) {
    console.error("Admin reset user password error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset user password",
    });
  }
};

// Fetch doctors list with search and pagination filters
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

// Fetch single doctor profile by document ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate(
      "user",
      "fullName email phoneNumber isActive"
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

// Register a new doctor along with associated user account
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
      availableSlots,
      availability,
    } = req.body;

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
        message: "All required fields must be filled",
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      const existingDoctor = await Doctor.findOne({ user: user._id });
      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: "User is already registered as a doctor",
        });
      }
    } else {
      user = await User.create({
        fullName,
        email,
        phoneNumber,
        password,
        role: "doctor",
        isActive: true,
      });
    }

    const doctor = await Doctor.create({
      user: user._id,
      department,
      specialization,
      qualification,
      experience: parseInt(experience),
      consultationFee: parseInt(consultationFee),
      availableSlots: availableSlots || availability || [],
      isAvailable: true,
      isVerified: true,
    });

    await doctor.populate("user", "fullName email phoneNumber isActive");

    if (req.userId) {
      try {
        await logUserActivity(req.userId, "CREATE_DOCTOR", {
          doctorId: doctor._id,
          email,
        });

        await logAudit(
          req,
          "CREATE",
          "DOCTOR",
          doctor._id,
          doctor.user?.fullName || fullName,
          `New doctor registered: ${doctor.user?.fullName || fullName}`
        );
      } catch (auditErr) {
        console.warn("Doctor create audit skipped:", auditErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error creating doctor:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create doctor",
      error: error.message,
    });
  }
};

// Update existing doctor profile and linked user records
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
      availableSlots,
      availability,
    } = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

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

    const doctorUpdate = {};
    if (department) doctorUpdate.department = department;
    if (specialization) doctorUpdate.specialization = specialization;
    if (qualification) doctorUpdate.qualification = qualification;
    if (experience !== undefined) doctorUpdate.experience = parseInt(experience);
    if (consultationFee !== undefined) doctorUpdate.consultationFee = parseInt(consultationFee);
    if (isAvailable !== undefined) doctorUpdate.isAvailable = isAvailable;
    if (isVerified !== undefined) doctorUpdate.isVerified = isVerified;
    if (availableSlots || availability) {
      doctorUpdate.availableSlots = availableSlots || availability;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, doctorUpdate, {
      new: true,
      runValidators: true,
    }).populate("user", "fullName email phoneNumber isActive");

    if (req.userId) {
      await logUserActivity(req.userId, "UPDATE_DOCTOR", {
        doctorId: id,
        updates: doctorUpdate,
      });

      await logAudit(
        req,
        "UPDATE",
        "DOCTOR",
        doctor._id,
        doctor.user?.fullName || "Doctor",
        `Doctor updated: ${Object.keys(doctorUpdate).join(", ")}`
      );
    }

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
        message: "Email or phone number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
};

// Permanently delete doctor and corresponding user account
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

    const hasAppointments = await Appointment.exists({ doctor: id });
    if (hasAppointments) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete doctor with existing appointments. Archive instead.",
      });
    }

    const doctorName = doctor.user?.fullName || "Doctor";

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(id);

    if (req.userId) {
      await logUserActivity(req.userId, "DELETE_DOCTOR", { doctorId: id });
      await logAudit(
        req,
        "DELETE",
        "DOCTOR",
        id,
        doctorName,
        `Doctor deleted: ${doctorName}`
      );
    }

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

// Fetch patients list with search capabilities and pagination
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

// Fetch single patient details including full appointment history
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

// Create new patient record and associated user credentials
export const createPatient = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, age, gender, bloodGroup, address, dateOfBirth } = req.body;

    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone number, and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      role: "patient",
      isActive: true,
    });

    let finalDob = dateOfBirth ? new Date(dateOfBirth) : null;
    if (!finalDob && age) {
      const birthYear = new Date().getFullYear() - parseInt(age);
      finalDob = new Date(birthYear, 0, 1);
    }

    const patient = await Patient.create({
      user: user._id,
      dateOfBirth: finalDob,
      gender: gender || "Male",
      bloodGroup: bloodGroup || "A+",
      address: typeof address === "string" ? { street: address } : address || {},
    });

    await patient.populate("user", "fullName email phoneNumber isActive createdAt");

    if (req.userId) {
      try {
        await logUserActivity(req.userId, "CREATE_PATIENT", { patientId: patient._id, email });
        await logAudit(req, "CREATE", "PATIENT", patient._id, fullName, `New patient registered: ${fullName}`);
      } catch (logErr) {
        console.warn("Audit log skipped:", logErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: patient,
    });
  } catch (error) {
    console.error("Error creating patient detailed:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create patient",
    });
  }
};

// Update existing patient data and profile details
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, age, gender, bloodGroup, address, status } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const userUpdate = {};
    if (fullName) userUpdate.fullName = fullName;
    if (email) userUpdate.email = email;
    if (phoneNumber) userUpdate.phoneNumber = phoneNumber;
    if (status !== undefined) userUpdate.isActive = status === "active";

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(patient.user, userUpdate, {
        new: true,
        runValidators: true,
      });
    }

    const patientUpdate = {};
    if (gender) patientUpdate.gender = gender;
    if (bloodGroup) patientUpdate.bloodGroup = bloodGroup;
    if (address) patientUpdate.address = typeof address === "string" ? { street: address } : address;
    if (age) {
      const birthYear = new Date().getFullYear() - parseInt(age);
      patientUpdate.dateOfBirth = new Date(birthYear, 0, 1);
    }

    const updatedPatient = await Patient.findByIdAndUpdate(id, patientUpdate, {
      new: true,
      runValidators: true,
    }).populate("user", "fullName email phoneNumber isActive createdAt");

    if (req.userId) {
      await logUserActivity(req.userId, "UPDATE_PATIENT", { patientId: id });
      await logAudit(req, "UPDATE", "PATIENT", id, fullName || "Patient", "Patient details updated");
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update patient",
      error: error.message,
    });
  }
};

// Remove patient and linked user document safely
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const hasAppointments = await Appointment.exists({ patient: id });
    if (hasAppointments) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete patient with active appointment history.",
      });
    }

    await User.findByIdAndDelete(patient.user);
    await Patient.findByIdAndDelete(id);

    if (req.userId) {
      await logUserActivity(req.userId, "DELETE_PATIENT", { patientId: id });
      await logAudit(req, "DELETE", "PATIENT", id, "Patient", "Patient profile removed");
    }

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete patient",
      error: error.message,
    });
  }
};

// Compute analytics metrics for system admin dashboard
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

// Fetch recent activity audit logs for current admin
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

// Retrieve all system appointments filtered by date or status
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

// Get detailed appointment object by ID
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

// Update status of appointment booking
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
      { new: true, runValidators: true }
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

    await logAudit(
      req,
      "UPDATE",
      "APPOINTMENT",
      appointment._id,
      `Appointment ${status}`,
      `Appointment status updated to ${status}`
    );

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

// Return operational database and server status indicators
export const getSystemHealth = async (req, res) => {
  try {
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

// Retrieve active hospital settings configuration
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

// Update active system settings cache and log changes
export const updateSettings = async (req, res) => {
  try {
    settingsCache = { ...settingsCache, ...req.body };

    await logUserActivity(req.userId, "UPDATE_SETTINGS", {
      settings: req.body,
    });

    await logAudit(
      req,
      "UPDATE",
      "SETTINGS",
      "system",
      "System Settings",
      `Settings updated: ${Object.keys(req.body).join(", ")}`
    );

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

// Retrieve support messages list with pagination
export const getSupportMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      SupportMessage.find(filter)
        .populate("user", "fullName email phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SupportMessage.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get support messages error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch support messages",
    });
  }
};

// Get single support ticket details by ID
export const getSupportMessageById = async (req, res) => {
  try {
    const supportMessage = await SupportMessage.findById(
      req.params.id
    ).populate("user", "fullName email phoneNumber");

    if (!supportMessage) {
      return res.status(404).json({
        success: false,
        error: "Support message not found",
      });
    }

    return res.json({
      success: true,
      data: supportMessage,
    });
  } catch (error) {
    console.error("Get support message error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch support message",
    });
  }
};

// Update status of specific support ticket
export const updateSupportMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["open", "in-progress", "resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid support message status",
      });
    }

    const supportMessage = await SupportMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("user", "fullName email phoneNumber");

    if (!supportMessage) {
      return res.status(404).json({
        success: false,
        error: "Support message not found",
      });
    }

    await logUserActivity(req.userId, "UPDATE_SUPPORT_MESSAGE", {
      supportMessageId: supportMessage._id,
      status,
    });

    await logAudit(
      req,
      "UPDATE",
      "SUPPORT_MESSAGE",
      supportMessage._id,
      supportMessage.subject,
      `Support message status updated to ${status}`
    );

    return res.json({
      success: true,
      message: "Support message status updated successfully",
      data: supportMessage,
    });
  } catch (error) {
    console.error("Update support message error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update support message",
    });
  }
};

// Fetch unread support ticket notifications for admin panel
export const getAdminNotifications = async (req, res) => {
  try {
    const openSupportMessages = await SupportMessage.find({
      status: { $regex: /^(open|pending)$/i },
    })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(10);

    const notifications = openSupportMessages.map((msg) => {
      const patientName =
        msg.user?.fullName || msg.email?.split("@")[0] || "Patient";

      return {
        _id: msg._id,
        title: msg.subject || "New Support Ticket",
        message: `${patientName}: ${msg.message || "Sent a support request"}`,
        type: (msg.subject || "").toUpperCase().includes("EMERGENCY")
          ? "emergency"
          : "patient",
        createdAt: msg.createdAt,
        read: (msg.status || "").toLowerCase() === "resolved",
        link: "/admin/support",
      };
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get admin notifications error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch admin notifications",
    });
  }
};

// Mark single support notification ticket as resolved
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await SupportMessage.findByIdAndUpdate(id, { status: "RESOLVED" });
    return res
      .status(200)
      .json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to mark as read" });
  }
};

// Mark all pending support notifications as resolved
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await SupportMessage.updateMany(
      { status: { $regex: /^(open|pending)$/i } },
      { $set: { status: "RESOLVED" } }
    );
    return res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to mark all as read" });
  }
};

// Delete support message ticket permanently
export const deleteSupportMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const supportMessage = await SupportMessage.findByIdAndDelete(id);

    if (!supportMessage) {
      return res.status(404).json({
        success: false,
        error: "Support message not found",
      });
    }

    return res.json({
      success: true,
      message: "Support ticket deleted successfully",
    });
  } catch (error) {
    console.error("Delete support message error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete support message",
    });
  }
};

let manualInvoices = [];

// Fetch aggregate list of auto-generated and manual invoices
export const getAllInvoices = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: "patient",
        populate: { path: "user", select: "fullName email phoneNumber" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "fullName" },
      })
      .sort({ createdAt: -1 });

    const autoInvoices = appointments.map((app) => {
      const docFee = app.doctor?.consultationFee || 500;
      const status =
        app.status === "completed"
          ? "Paid"
          : app.status === "cancelled"
          ? "Cancelled"
          : "Pending";

      return {
        _id: app._id,
        invoiceId: `INV-${app._id.toString().slice(-6).toUpperCase()}`,
        patientName: app.patient?.user?.fullName || "Patient",
        patientEmail: app.patient?.user?.email || "N/A",
        doctorName: app.doctor?.user?.fullName || "Doctor",
        department: app.doctor?.department || "General",
        consultationFee: docFee,
        totalAmount: docFee,
        paymentStatus: status,
        billingDate: app.date || app.createdAt,
        type: "Appointment Fee",
      };
    });

    const allInvoices = [...manualInvoices, ...autoInvoices];

    return res.status(200).json({
      success: true,
      data: allInvoices,
    });
  } catch (error) {
    console.error("Get all invoices error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch invoices",
    });
  }
};

// Create a new manual billing invoice entry
export const createInvoice = async (req, res) => {
  try {
    const billData = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...req.body,
      createdAt: new Date(),
    };
    manualInvoices.unshift(billData);

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: billData,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create invoice",
    });
  }
};

// Update payment status for manual or appointment invoice
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const app = await Appointment.findById(id);
    if (app) {
      app.status = status === "paid" ? "completed" : status;
      await app.save();
    } else {
      manualInvoices = manualInvoices.map((inv) =>
        inv._id === id ? { ...inv, paymentStatus: "Paid", status: "Paid" } : inv
      );
    }

    return res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
    });
  } catch (error) {
    console.error("Update invoice status error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update invoice status",
    });
  }
};

// Change password for logged-in admin user
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const adminUser = await User.findById(req.userId).select("+password");

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user record not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(newPassword, salt);
    await adminUser.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change Password Backend Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating password",
    });
  }
};