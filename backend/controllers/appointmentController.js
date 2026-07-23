import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

// @desc  Patient books a new appointment
// @route POST /api/appointments
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reasonForVisit } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: "doctorId, date and timeSlot are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // prevent double-booking of the same doctor/date/timeSlot
    const clash = await Appointment.findOne({
      doctor: doctorId,
      date,
      timeSlot,
      status: { $ne: "cancelled" },
    });
    if (clash) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      department: doctor.department,
      date,
      timeSlot,
      reasonForVisit,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Patient views their own appointments
// @route GET /api/appointments/my
export const getMyAppointmentsAsPatient = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({
        path: "doctor",
        populate: [{ path: "user", select: "name" }, { path: "department", select: "name" }],
      })
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Patient cancels their own appointment
// @route PUT /api/appointments/:id/cancel
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
