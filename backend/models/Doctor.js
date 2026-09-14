import mongoose from "mongoose";

// Define database schema for Doctor profiles and time slot schedules
const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: [
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "Dermatology",
        "Ophthalmology",
        "ENT",
        "Gynecology",
        "Urology",
        "General Surgery",
        "Psychiatry",
        "Radiology",
        "Pathology",
        "Anesthesiology",
      ],
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
      max: [50, "Experience cannot exceed 50 years"],
    },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Fee cannot be negative"],
    },
    availableSlots: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    ratings: [
      {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
        rating: { type: Number, min: 1, max: 5, required: true },
        review: { type: String, trim: true, maxlength: 500 },
        date: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    bio: { type: String, trim: true, maxlength: 500 },
    languages: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate average doctor rating prior to document save operations
doctorSchema.pre("save", function () {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    this.averageRating = Number((sum / this.ratings.length).toFixed(1));
    this.totalRatings = this.ratings.length;
  }
});

// Add database indexes for optimized search performance
doctorSchema.index({ department: 1 });
doctorSchema.index({ isVerified: 1, isAvailable: 1 });
doctorSchema.index({ averageRating: -1 });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;