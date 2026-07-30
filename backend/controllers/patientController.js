// controllers/patientController.js
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { logUserActivity } from '../utils/authHelpers.js';

// Get patient profile
export const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId })
      .populate('medicalHistory.doctor', 'specialization department');
    
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        error: 'Patient profile not found' 
      });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile' 
    });
  }
};

// Update patient profile
export const updateProfile = async (req, res) => {
  try {
    const updateData = req.body;
    
    const patient = await Patient.findOneAndUpdate(
      { user: req.userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        error: 'Patient profile not found' 
      });
    }

    await logUserActivity(req.userId, 'UPDATE_PATIENT_PROFILE');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update profile' 
    });
  }
};

// Book appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms } = req.body;
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        success: false,
        error: 'Time slot is already booked' 
      });
    }

    const appointment = new Appointment({
      patient: req.userId,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      symptoms,
      status: 'pending'
    });

    await appointment.save();

    await logUserActivity(req.userId, 'BOOK_APPOINTMENT', { 
      doctorId, 
      date, 
      timeSlot 
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to book appointment' 
    });
  }
};

// Get patient appointments
export const getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { patient: req.userId };
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('doctor', 'specialization department consultationFee')
        .populate('doctor.user', 'fullName')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: -1 }),
      Appointment.countDocuments(filter)
    ]);

    res.json({
      success: true,
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointments' 
    });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate('doctor', 'specialization department consultationFee')
      .populate('doctor.user', 'fullName')
      .populate('patient', 'dateOfBirth gender bloodGroup');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    // Check if the appointment belongs to the patient
    if (appointment.patient.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointment' 
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    if (appointment.patient.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot cancel this appointment' 
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    await logUserActivity(req.userId, 'CANCEL_APPOINTMENT', { appointmentId: id });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to cancel appointment' 
    });
  }
};

// Get medical history
export const getMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId })
      .populate('medicalHistory.doctor', 'specialization department')
      .populate('medicalHistory.doctor.user', 'fullName');
    
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        error: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      medicalHistory: patient.medicalHistory || []
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch medical history' 
    });
  }
};

// Add medical history
export const addMedicalHistory = async (req, res) => {
  try {
    const { condition, diagnosedDate, treatment, doctorId, status, notes } = req.body;
    
    const patient = await Patient.findOne({ user: req.userId });
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        error: 'Patient not found' 
      });
    }

    patient.medicalHistory.push({
      condition,
      diagnosedDate: new Date(diagnosedDate),
      treatment,
      doctor: doctorId,
      status: status || 'Active',
      notes
    });

    await patient.save();

    await logUserActivity(req.userId, 'ADD_MEDICAL_HISTORY', { condition });

    res.status(201).json({
      success: true,
      message: 'Medical history added successfully',
      medicalHistory: patient.medicalHistory
    });
  } catch (error) {
    console.error('Add medical history error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add medical history' 
    });
  }
};

// Get available doctors
export const getAvailableDoctors = async (req, res) => {
  try {
    const { department, specialization, page = 1, limit = 10 } = req.query;
    
    const filter = { isAvailable: true, isVerified: true };
    if (department) filter.department = department;
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .populate('user', 'fullName email phoneNumber')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ averageRating: -1 }),
      Doctor.countDocuments(filter)
    ]);

    res.json({
      success: true,
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get available doctors error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch doctors' 
    });
  }
};

// Get doctor details
export const getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id)
      .populate('user', 'fullName email phoneNumber')
      .populate('ratings.patient', 'fullName');
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    console.error('Get doctor details error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch doctor details' 
    });
  }
};