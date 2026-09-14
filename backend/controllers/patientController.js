import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import SupportMessage from "../models/SupportMessage.js";
import { logUserActivity } from "../utils/authHelpers.js";
import { logAudit } from '../middleware/auditLog.js';

// Retrieve profile record for currently authenticated patient
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const patient = await Patient.findOne({ user: userId })
      .populate("user", "fullName email phoneNumber profilePhoto")
      .populate("medicalHistory.doctor", "specialization department");

    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient profile not found" });
    }

    res.json({ success: true, patient });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
};

// Update patient profile details and synchronize changes with linked user record
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const { fullName, phoneNumber, ...updateData } = req.body;

    if (fullName || phoneNumber) {
      const userUpdate = {};
      if (fullName) userUpdate.fullName = fullName;
      if (phoneNumber) userUpdate.phoneNumber = phoneNumber;
      await User.findByIdAndUpdate(userId, userUpdate, { runValidators: true });
    }

    const patient = await Patient.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "fullName email phoneNumber profilePhoto");

    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient profile not found" });
    }

    await logUserActivity(userId, "UPDATE_PATIENT_PROFILE");
    await logAudit(
      req,
      'UPDATE',
      'PATIENT',
      patient._id,
      patient.user?.fullName || 'Patient',
      `Patient profile updated`
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      patient,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
};

// Reserve an appointment slot with specified doctor
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const {
      doctorId,
      date,
      timeSlot,
      symptoms,
      appointmentType,
      reason,
      notes,
    } = req.body;

    const patient = await Patient.findOne({ user: userId }).populate('user', 'fullName');
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient profile not found" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor not found" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: startDate, $lte: endDate },
      timeSlot,
      status: { $nin: ["cancelled", "rejected"] },
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, error: "Time slot is already booked" });
    }

    const appointment = new Appointment({
      patient: patient._id,
      doctor: doctorId,
      department: doctor.department,
      consultationFee: doctor.consultationFee,
      date: new Date(date),
      timeSlot,
      appointmentType: appointmentType || "In-Person",
      reason,
      symptoms,
      notes,
      status: "pending",
    });

    await appointment.save();

    await logUserActivity(userId, "BOOK_APPOINTMENT", { doctorId, date, timeSlot });
    await logAudit(
      req,
      'BOOK',
      'APPOINTMENT',
      appointment._id,
      `${patient.user?.fullName || 'Patient'} booked appointment`,
      `Appointment booked for ${new Date(date).toLocaleDateString()} at ${timeSlot}`
    );

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ success: false, error: "Failed to book appointment" });
  }
};

// Fetch paginated list of appointments for logged-in patient
export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient profile not found" });
    }

    const filter = { patient: patient._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate({
          path: "doctor",
          select: "specialization department consultationFee averageRating experience user",
          populate: {
            path: "user",
            select: "fullName email phoneNumber profilePhoto",
          },
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: -1 }),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch appointments" });
  }
};

// Fetch specific appointment details ensuring patient ownership
export const getAppointmentById = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate("doctor", "specialization department consultationFee")
      .populate("doctor.user", "fullName")
      .populate("patient", "dateOfBirth gender bloodGroup");

    if (!appointment) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }

    const patient = await Patient.findOne({ user: userId });
    if (!patient || appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch appointment" });
  }
};

// Cancel an upcoming or pending appointment order
export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }

    const patient = await Patient.findOne({ user: userId });
    if (!patient || appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return res.status(400).json({ success: false, error: "Cannot cancel this appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    await logUserActivity(userId, "CANCEL_APPOINTMENT", { appointmentId: id });
    await logAudit(req, 'CANCEL', 'APPOINTMENT', appointment._id, `Appointment cancelled`, `Appointment cancelled`);

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ success: false, error: "Failed to cancel appointment" });
  }
};

// Submit feedback rating for completed appointment consultation
export const rateAppointment = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const { id } = req.params;
    const { rating } = req.body;

    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, error: "Rating must be between 1 and 5" });
    }

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient profile not found" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: "Appointment not found" });
    }

    if (appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({ success: false, error: "Only completed appointments can be rated" });
    }

    appointment.rating = ratingNum;
    await appointment.save();

    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      if (!Array.isArray(doctor.ratings)) {
        doctor.ratings = [];
      }

      const existingIndex = doctor.ratings.findIndex(
        (r) => r.patient && r.patient.toString() === patient._id.toString()
      );

      if (existingIndex > -1) {
        doctor.ratings[existingIndex].rating = ratingNum;
        doctor.ratings[existingIndex].date = new Date();
      } else {
        doctor.ratings.push({
          patient: patient._id,
          rating: ratingNum,
          date: new Date(),
        });
      }

      await doctor.save();
    }

    await logUserActivity(userId, "RATE_DOCTOR", { appointmentId: id, rating: ratingNum });

    res.json({
      success: true,
      message: "Rating submitted successfully",
      rating: appointment.rating,
      averageRating: doctor?.averageRating || 0,
    });
  } catch (error) {
    console.error("Rate appointment error:", error);
    res.status(500).json({ success: false, error: "Failed to submit rating" });
  }
};

// Fetch medical history entries for active patient profile
export const getMedicalHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const patient = await Patient.findOne({ user: userId })
      .populate("medicalHistory.doctor", "specialization department")
      .populate("medicalHistory.doctor.user", "fullName");

    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    res.json({
      success: true,
      medicalHistory: patient.medicalHistory || [],
    });
  } catch (error) {
    console.error("Get medical history error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch medical history" });
  }
};

// Append new medical condition entry to patient history record
export const addMedicalHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const { condition, diagnosedDate, treatment, doctorId, status, notes } = req.body;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient profile not found" });
    }

    patient.medicalHistory.push({
      condition,
      diagnosedDate: new Date(diagnosedDate),
      treatment,
      doctor: doctorId,
      status: status || "Active",
      notes,
    });

    await patient.save();

    await logUserActivity(userId, "ADD_MEDICAL_HISTORY", { condition });
    await logAudit(req, 'CREATE', 'MEDICAL_RECORD', patient._id, `Medical history added`, `Condition: ${condition}`);

    res.status(201).json({
      success: true,
      message: "Medical history added successfully",
      medicalHistory: patient.medicalHistory,
    });
  } catch (error) {
    console.error("Add medical history error:", error);
    res.status(500).json({ success: false, error: "Failed to add medical history" });
  }
};

// Query list of verified available doctors with department filter
export const getAvailableDoctors = async (req, res) => {
  try {
    const { department, specialization, page = 1, limit = 10 } = req.query;

    const filter = { isAvailable: true, isVerified: true };
    if (department) filter.department = department;
    if (specialization) filter.specialization = { $regex: specialization, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .populate("user", "fullName email phoneNumber profilePhoto")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ averageRating: -1 }),
      Doctor.countDocuments(filter),
    ]);

    res.json({
      success: true,
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get available doctors error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch doctors" });
  }
};

// Fetch public profile details and ratings for selected doctor
export const getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id)
      .populate("user", "fullName email phoneNumber profilePhoto")
      .populate("ratings.patient", "fullName");

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor not found" });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    console.error("Get doctor details error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch doctor details" });
  }
};

// Retrieve active medication list extracted from appointment prescriptions
export const getMedications = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    const appointments = await Appointment.find({
      patient: patient._id,
      status: { $in: ["confirmed", "completed"] },
      prescription: { $exists: true, $ne: null }
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(20);

    const medications = [];

    appointments.forEach((appointment) => {
      const prescription = appointment.prescription;
      if (!prescription) return;

      if (Array.isArray(prescription.medications)) {
        prescription.medications.forEach((med, index) => {
          const times = Array.isArray(med.times) ? med.times : getMedicationTimes(med.frequency);

          medications.push({
            _id: `${appointment._id}-${index}`,
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            times,
            taken: [],
            takenCount: 0,
            totalDoses: times.length,
            progress: 0,
            appointmentId: appointment._id,
            prescribedDate: appointment.date
          });
        });
      }
    });

    res.json({ success: true, medications });
  } catch (error) {
    console.error("Get medications error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch medications" });
  }
};

// Parse medication frequency string into scheduled daily time slots
const getMedicationTimes = (frequency = "") => {
  const value = frequency.toLowerCase();

  if (value.includes("three") || value.includes("3") || value.includes("thrice")) {
    return ["Morning", "Afternoon", "Night"];
  }

  if (value.includes("twice") || value.includes("2") || value.includes("two")) {
    return ["Morning", "Night"];
  }

  return ["Morning"];
};

// Return placeholder array for patient health metrics tracking
export const getHealthMetrics = async (req, res) => {
  try {
    res.json({ success: true, metrics: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch health metrics' });
  }
};

// Return emergency contact numbers associated with patient
export const getEmergencyContacts = async (req, res) => {
  try {
    res.json({ success: true, contacts: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch emergency contacts' });
  }
};

// Create support ticket and forward to system administration desk
export const sendSupportMessage = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    const { subject, message, email } = req.body;

    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, error: "Subject and message are required" });
    }

    const user = await User.findById(userId);
    const userEmail = email || user?.email || "patient@medicare.com";

    const supportMessage = await SupportMessage.create({
      user: userId,
      email: userEmail,
      subject: subject.trim(),
      message: message.trim(),
      status: "open",
    });

    await logUserActivity(userId, "SUPPORT_MESSAGE", {
      supportMessageId: supportMessage._id,
      subject: subject.trim(),
    });

    await logAudit(
      req,
      'CREATE',
      'SUPPORT_MESSAGE',
      supportMessage._id,
      user?.fullName || 'Patient',
      `Support message created: ${subject.trim()}`
    );

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      supportMessage,
    });
  } catch (error) {
    console.error("Send support message error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to submit support message",
      details: error.message,
    });
  }
};