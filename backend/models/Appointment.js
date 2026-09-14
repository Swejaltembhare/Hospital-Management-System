import mongoose from 'mongoose';

// Define database schema for patient-doctor appointment bookings
const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ['In-Person', 'Online', 'Video Consultation', 'Emergency'],
      default: 'In-Person',
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      default: '',
    },
    symptoms: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    prescription: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  { timestamps: true }
);

// Add index on doctor, date, and timeSlot for optimized query performance
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 });

export default mongoose.model('Appointment', appointmentSchema);