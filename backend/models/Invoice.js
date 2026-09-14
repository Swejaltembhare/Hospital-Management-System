// backend/models/Invoice.js
import mongoose from 'mongoose';

// Define schema for itemized medical billing services
const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Define database schema for patient billing invoices and payment tracking
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'patientModel',
      required: true,
    },
    patientModel: {
      type: String,
      enum: ['User', 'Patient'],
      default: 'User',
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientEmail: {
      type: String,
      trim: true,
    },
    patientPhone: {
      type: String,
      trim: true,
    },
    patientId: {
      type: String,
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    doctorName: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    services: [serviceSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Insurance', 'Other'],
      default: 'Cash',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partially Paid', 'Cancelled'],
      default: 'Pending',
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate remaining balance due and update payment status prior to saving document
invoiceSchema.pre('save', function () {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    this.invoiceNumber = `INV-${year}${month}${day}-${random}`;
  }

  this.balanceDue = Math.max(0, this.totalAmount - this.amountPaid);

  if (this.balanceDue === 0 && this.totalAmount >= 0) {
    this.paymentStatus = 'Paid';
  } else if (this.balanceDue > 0 && this.balanceDue < this.totalAmount) {
    this.paymentStatus = 'Partially Paid';
  } else if (this.balanceDue === this.totalAmount && this.totalAmount > 0) {
    this.paymentStatus = 'Pending';
  }
});

// Add indexes for efficient invoice searches and patient lookup operations
invoiceSchema.index({ patient: 1 });
invoiceSchema.index({ paymentStatus: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;