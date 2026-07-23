import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

// @desc  Get all doctors (public - for patients to browse & book)
// @route GET /api/doctors
export const getDoctors = async (req, res) => {
  try {
    const { department, specialization } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (specialization) filter.specialization = new RegExp(specialization, "i");

    const doctors = await Doctor.find(filter)
      .populate("user", "name")
      .populate("department", "name");

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single doctor details (public)
// @route GET /api/doctors/:id
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("department", "name");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get logged-in doctor's own appointments
// @route GET /api/doctors/me/appointments
export const getMyAppointments = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found" });

    const appointments = await Appointment.find({ doctor: doctorProfile._id })
      .populate("patient", "name email phone")
      .sort({ date: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Doctor updates appointment status and/or adds prescription
// @route PUT /api/doctors/appointments/:id
export const updateAppointmentByDoctor = async (req, res) => {
  try {
    const { status, prescription } = req.body;

    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found" });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // ensure doctor can only edit their own appointments
    if (appointment.doctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this appointment" });
    }

    if (status) appointment.status = status;
    if (prescription) appointment.prescription = prescription;

    await appointment.save();
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
