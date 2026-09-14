import mongoose from 'mongoose';

// Define database schema for Admin profiles and granular permission controls
const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_doctors', 'manage_patients', 'manage_appointments',
           'view_reports', 'manage_system', 'manage_billing', 'manage_medicines']
  }],
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  activityLog: [{
    action: { type: String, required: true },
    details: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Configure default permissions automatically for new Admin documents
adminSchema.pre('save', function() {
  if (this.isNew) {
    if (this.isSuperAdmin) {
      this.permissions = [
        'manage_users', 'manage_doctors', 'manage_patients', 'manage_appointments',
        'view_reports', 'manage_system', 'manage_billing', 'manage_medicines'
      ];
    } else if (!this.permissions || this.permissions.length === 0) {
      this.permissions = ['manage_users', 'manage_doctors', 'manage_patients', 'view_reports'];
    }
  }
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;