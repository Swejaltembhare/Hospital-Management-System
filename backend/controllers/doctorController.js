import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { logUserActivity } from '../utils/authHelpers.js';

// Fetch logged-in doctor profile with linked user and rating details
export const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId })
      .populate('user', 'fullName email phoneNumber profilePhoto')
      .populate('ratings.patient', 'fullName');
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Doctor profile not found' 
      });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

// Update doctor information and synchronize changes to linked user profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, ...updateData } = req.body;
    
    if (fullName || phoneNumber) {
      const userUpdate = {};
      if (fullName) userUpdate.fullName = fullName;
      if (phoneNumber) userUpdate.phoneNumber = phoneNumber;
      await User.findByIdAndUpdate(req.userId, userUpdate, { runValidators: true });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'fullName email phoneNumber profilePhoto');
    
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    await logUserActivity(req.userId, 'UPDATE_DOCTOR_PROFILE');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

// Retrieve configured weekly time slot availability list for doctor
export const getAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    res.json({
      success: true,
      availableSlots: doctor.availableSlots || []
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch availability' });
  }
};

// Save updated weekly time slot schedule for active doctor
export const updateAvailability = async (req, res) => {
  try {
    const { availableSlots } = req.body;
    
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.userId },
      { $set: { availableSlots } },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    await logUserActivity(req.userId, 'UPDATE_AVAILABILITY');

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availableSlots: doctor.availableSlots
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ success: false, error: 'Failed to update availability' });
  }
};

// Fetch paginated appointments assigned to active doctor
export const getMyAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
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
        .populate({
          path: 'patient',
          select: 'fullName dateOfBirth gender bloodGroup user',
          populate: { path: 'user', select: 'fullName email phoneNumber' }
        })
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
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
  }
};

// Get complete appointment details ensuring doctor ownership
export const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate({
        path: 'patient',
        select: 'fullName dateOfBirth gender bloodGroup user',
        populate: { path: 'user', select: 'fullName email phoneNumber' }
      });
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Get appointment details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointment details' });
  }
};

// Update status, prescription, and clinical notes for an appointment
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, prescription, notes } = req.body;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (status) appointment.status = status;
    if (prescription) appointment.prescription = prescription;
    if (notes) appointment.notes = notes;
    await appointment.save();

    await logUserActivity(req.userId, 'UPDATE_APPOINTMENT_STATUS', { appointmentId: id, status });

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update appointment status' });
  }
};

// Retrieve paginated list of patients who have booked with active doctor
export const getMyPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

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
    res.status(500).json({ success: false, error: 'Failed to fetch patients' });
  }
};

// Retrieve patient record and prior appointment history for doctor
export const getPatientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id)
      .populate('user', 'fullName email phoneNumber')
      .populate('medicalHistory.doctor', 'specialization department');
    
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

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
    res.status(500).json({ success: false, error: 'Failed to fetch patient details' });
  }
};

// Fetch patient review ratings and aggregate scores for doctor
export const getMyRatings = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId })
      .populate('ratings.patient', 'fullName');
    
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    res.json({
      success: true,
      ratings: doctor.ratings || [],
      averageRating: doctor.averageRating || 0,
      totalRatings: doctor.totalRatings || 0
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ratings' });
  }
};

// Fetch formatted public directory list of all registered doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", "fullName email phoneNumber");

    const formattedDoctors = doctors.map((doctor) => ({
      _id: doctor._id,
      fullName: doctor.user?.fullName,
      email: doctor.user?.email,
      phoneNumber: doctor.user?.phoneNumber,
      department: doctor.department,
      specialization: doctor.specialization,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      isAvailable: doctor.isAvailable,
      availableSlots: doctor.availableSlots || [],
      languages: doctor.languages,
      averageRating: doctor.averageRating,
    }));

    res.status(200).json({
      success: true,
      doctors: formattedDoctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch doctors" });
  }
};

// Calculate open and booked time slots for doctor on requested date
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required", slots: [] });
    }

    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date", slots: [] });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found", slots: [] });
    }

    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });

    const daySlots = (doctor.availableSlots || []).filter(
      (slot) => slot.day?.toLowerCase() === dayName.toLowerCase()
    );

    if (daySlots.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No availability for ${dayName}`,
        slots: [],
      });
    }

    let generatedSlots = [];

    daySlots.forEach((availability) => {
      const [startHour, startMinute] = availability.startTime.split(":").map(Number);
      const [endHour, endMinute] = availability.endTime.split(":").map(Number);

      let start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;

      if (Number.isNaN(start) || Number.isNaN(end) || start >= end) return;

      while (start < end) {
        const hour = Math.floor(start / 60);
        const minute = start % 60;
        const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

        generatedSlots.push({ time, booked: false });
        start += 30;
      }
    });

    const uniqueSlots = Array.from(
      new Map(generatedSlots.map((slot) => [slot.time, slot])).values()
    );

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startDate, $lte: endDate },
      status: { $nin: ["cancelled", "rejected"] },
    }).select("timeSlot");

    const bookedTimes = new Set(bookedAppointments.map((apt) => apt.timeSlot));

    const finalSlots = uniqueSlots.map((slot) => ({
      ...slot,
      booked: bookedTimes.has(slot.time),
    }));

    return res.status(200).json({
      success: true,
      doctorId,
      date,
      day: dayName,
      slots: finalSlots,
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch available slots", slots: [] });
  }
};