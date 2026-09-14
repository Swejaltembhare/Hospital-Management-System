import mongoose from 'mongoose';

// Define database schema for lab test orders and diagnostic results
const labTestSchema = new mongoose.Schema(
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
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    testType: {
      type: String,
      enum: ['Lab', 'Radiology', 'Imaging', 'Pathology', 'Other'],
      default: 'Lab',
    },
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency'],
      default: 'Routine',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    result: {
      type: String,
      trim: true,
    },
    resultFile: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    orderedDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for fast lookup by patient, doctor, and status
labTestSchema.index({ patient: 1 });
labTestSchema.index({ doctor: 1 });
labTestSchema.index({ status: 1 });
labTestSchema.index({ orderedDate: -1 });

const LabTest = mongoose.model('LabTest', labTestSchema);
export default LabTest;