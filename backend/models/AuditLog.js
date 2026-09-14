import mongoose from 'mongoose';

// Define database schema for system audit log records
const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: String,
      enum: ['admin', 'doctor', 'patient', 'system'],
      default: 'admin',
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREATE',
        'UPDATE',
        'DELETE',
        'BOOK',
        'CANCEL',
        'COMPLETE',
        'VIEW',
        'PRESCRIPTION',
        'PAYMENT',
        'STATUS_CHANGE',
        'EXPORT',
        'SUPPORT_MESSAGE',
        'SETTINGS',
      ],
      required: true,
    },
    resource: {
      type: String,
      enum: [
        'PATIENT',
        'DOCTOR',
        'APPOINTMENT',
        'PRESCRIPTION',
        'BILLING',
        'USER',
        'MEDICAL_RECORD',
        'TEST_RESULT',
        'LAB_TEST',
        'SUPPORT_MESSAGE',
        'SETTINGS',
      ],
      required: true,
    },
    resourceId: {
      type: String,
      default: '',
      trim: true,
    },
    resourceName: {
      type: String,
      default: '',
      trim: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
      trim: true,
    },
    userAgent: {
      type: String,
      default: '',
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for optimized filtering and pagination performance
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;