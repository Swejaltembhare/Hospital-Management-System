// controllers/doctorController.js
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { logUserActivity } from '../utils/authHelpers.js';

// Get doctor profile
export const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId })
      .populate('user', 'fullName email phoneNumber')
      .populate('ratings.patient', 'fullName');
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor profile not found' 
      });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile' 
    });
  }
};

// Update doctor profile
export const updateProfile = async (req, res) => {
  try {
    const updateData = req.body;
    
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor profile not found' 
      });
    }

    await logUserActivity(req.userId, 'UPDATE_DOCTOR_PROFILE');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update profile' 
    });
  }
};

// Get availability
export const getAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    res.json({
      success: true,
      availability: doctor.availableSlots || []
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch availability' 
    });
  }
};

// Update availability
export const updateAvailability = async (req, res) => {
  try {
    const { availableSlots } = req.body;
    
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.userId },
      { availableSlots },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    await logUserActivity(req.userId, 'UPDATE_AVAILABILITY');

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: doctor.availableSlots
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update availability' 
    });
  }
};

// Get doctor appointments
export const getMyAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    const filter = { doctor: doctor._id };
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patient', 'fullName email phoneNumber')
        .populate('patient.user', 'fullName')
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

// Get appointment details
export const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate('patient', 'fullName email phoneNumber')
      .populate('patient.user', 'fullName');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    // Check if appointment belongs to this doctor
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
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
    console.error('Get appointment details error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch appointment details' 
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, prescription, notes } = req.body;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    // Check if appointment belongs to this doctor
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    appointment.status = status;
    if (prescription) appointment.prescription = prescription;
    if (notes) appointment.notes = notes;
    await appointment.save();

    await logUserActivity(req.userId, 'UPDATE_APPOINTMENT_STATUS', { 
      appointmentId: id, 
      status 
    });

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update appointment status' 
    });
  }
};

// Get doctor's patients
export const getMyPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    // Get unique patient IDs from appointments
    const appointments = await Appointment.find({ 
      doctor: doctor._id,
      status: { $in: ['completed', 'confirmed'] }
    }).distinct('patient');

    const filter = { _id: { $in: appointments } };
    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ],
        role: 'patient'
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      filter.user = { $in: userIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate('user', 'fullName email phoneNumber')
        .skip(skip)
        .limit(parseInt(limit)),
      Patient.countDocuments(filter)
    ]);

    res.json({
      success: true,
      patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch patients' 
    });
  }
};

// Get patient details
export const getPatientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id)
      .populate('user', 'fullName email phoneNumber')
      .populate('medicalHistory.doctor', 'specialization department');
    
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        error: 'Patient not found' 
      });
    }

    // Get appointments with this doctor
    const doctor = await Doctor.findOne({ user: req.userId });
    const appointments = await Appointment.find({
      patient: id,
      doctor: doctor._id
    }).sort({ date: -1 });

    res.json({
      success: true,
      patient: {
        ...patient.toJSON(),
        appointments
      }
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch patient details' 
    });
  }
};

// Get doctor ratings
export const getMyRatings = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId })
      .populate('ratings.patient', 'fullName');
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    res.json({
      success: true,
      ratings: doctor.ratings || [],
      averageRating: doctor.averageRating || 0,
      totalRatings: doctor.totalRatings || 0
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch ratings' 
    });
  }
};