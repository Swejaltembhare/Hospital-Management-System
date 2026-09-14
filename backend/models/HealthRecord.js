import mongoose from 'mongoose';

// Define database schema for patient health metrics and vital signs tracking
const healthRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bloodPressureSystolic: {
      type: Number,
      min: 0,
    },
    bloodPressureDiastolic: {
      type: Number,
      min: 0,
    },
    heartRate: {
      type: Number,
      min: 0,
    },
    bloodSugar: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    bmi: {
      type: Number,
      min: 0,
    },
    temperature: {
      type: Number,
    },
    recordedAt: {
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

// Calculate body mass index prior to saving document when height and weight exist
healthRecordSchema.pre('save', function () {
  if (this.height && this.weight && this.height > 0) {
    const heightInMeters = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
});

// Add database index on patient and record date for fast chronological queries
healthRecordSchema.index({ patient: 1, recordedAt: -1 });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
export default HealthRecord;