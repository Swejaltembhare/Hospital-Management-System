import mongoose from "mongoose";

// Define database schema for patient and user support helpdesk tickets
const supportMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
    response: {
      type: String,
      trim: true,
      default: "",
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add database indexes for efficient admin helpdesk filter operations
supportMessageSchema.index({ user: 1 });
supportMessageSchema.index({ status: 1 });
supportMessageSchema.index({ createdAt: -1 });

const SupportMessage = mongoose.model(
  "SupportMessage",
  supportMessageSchema
);

export default SupportMessage;