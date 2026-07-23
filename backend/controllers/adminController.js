import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Department from "../models/Department.js";
import Appointment from "../models/Appointment.js";

// ---------- DEPARTMENTS ----------

// @desc Create department
// @route POST /api/admin/departments
export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Department name is required" });

    const exists = await Department.findOne({ name });
    if (exists) return res.status(400).json({ message: "Department already exists" });

    const department = await Department.create({ name, description });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all departments
// @route GET /api/admin/departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete department
// @route DELETE /api/admin/departments/:id
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- DOCTORS ----------

// @desc Admin creates a doctor (creates User + Doctor profile together)
// @route POST /api/admin/doctors
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      department,
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      availableSlots,
    } = req.body;

    if (!name || !email || !password || !department || !specialization) {
      return res.status(400).json({
        message: "name, email, password, department and specialization are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const departmentDoc = await Department.findById(department);
    if (!departmentDoc) return res.status(404).json({ message: "Department not found" });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "doctor",
    });

    const doctor = await Doctor.create({
      user: user._id,
      department,
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      availableSlots: availableSlots || [],
    });

    res.status(201).json({
      _id: doctor._id,
      user: { _id: user._id, name: user.name, email: user.email },
      department,
      specialization,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all doctors (with user + department populated)
// @route GET /api/admin/doctors
export const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", "name email phone")
      .populate("department", "name");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a doctor (removes both Doctor profile and User account)
// @route DELETE /api/admin/doctors/:id
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await User.findByIdAndDelete(doctor.user);
    await doctor.deleteOne();

    res.status(200).json({ message: "Doctor removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- OVERVIEW ----------

// @desc Get all appointments (admin overview)
// @route GET /api/admin/appointments
export const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email")
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

// @desc Dashboard stats (counts) — used by analytics/charts on frontend
// @route GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await Doctor.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    res.status(200).json({
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalAppointments,
      todaysAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
