import mongoose from 'mongoose';

// Define schema for individual prescribed medication items
const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
  },
  frequency: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  instructions: {
    type: String,
    trim: true,
  },
});

// Define database schema for medical prescriptions issued to patients
const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'patientModel',
      required: true,
    },
    patientModel: {
      type: String,
      enum: ['Patient', 'User'],
      default: 'Patient',
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    medicines: [medicineSchema],
    instructions: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    prescribedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add database indexes for fast query filtering by patient, doctor, and status
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ isActive: 1 });
prescriptionSchema.index({ prescribedDate: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;