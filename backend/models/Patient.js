import mongoose from 'mongoose';

// Define database schema for Patient profiles and medical history
const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: null,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
    },
    medicalHistory: [
      {
        condition: { type: String, required: true },
        diagnosedDate: { type: Date, required: true },
        treatment: String,
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
        status: {
          type: String,
          enum: ['Active', 'Resolved', 'Chronic'],
          default: 'Active',
        },
        notes: String,
      },
    ],
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^[0-9]{10}$/.test(v);
          },
          message: 'Please enter a valid 10-digit phone number',
        },
      },
    },
    allergies: [{ type: String, trim: true }],
    chronicConditions: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate patient age dynamically from dateOfBirth
patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual property to construct complete address string
patientSchema.virtual('fullAddress').get(function () {
  const parts = [
    this.address?.street,
    this.address?.city,
    this.address?.state,
    this.address?.zipCode,
    this.address?.country,
  ];
  return parts.filter(Boolean).join(', ');
});

// Database index for fast city lookup operations
patientSchema.index({ 'address.city': 1 });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;