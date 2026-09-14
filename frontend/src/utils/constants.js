export const DEPARTMENTS = Object.freeze([
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Gynecology",
  "ENT",
  "General Medicine",
  "Psychiatry",
  "Emergency Medicine",
]);

// Medical Qualifications List
export const QUALIFICATIONS = Object.freeze([
  "MBBS",
  "MD",
  "MS",
  "DM",
  "MCh",
  "BDS",
  "MDS",
  "Other",
]);

// Appointment Status Dictionaries & Badges
export const APPOINTMENT_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

export const APPOINTMENT_STATUS_CONFIG = Object.freeze({
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", color: "bg-teal-50 text-teal-700 border-teal-200" },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200" },
});

// Patient Demographics & Vitals Constants
export const BLOOD_GROUPS = Object.freeze(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);

export const GENDERS = Object.freeze(["Male", "Female", "Other"]);

// Daily Doctor Schedule Slots
export const TIME_SLOTS = Object.freeze([
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
]);