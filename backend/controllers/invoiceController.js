import Invoice from '../models/Invoice.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

// Generate sequential invoice identification string based on current date
const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const prefix = `INV-${year}${month}${day}-`;

  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `^${prefix}` },
  }).sort({ invoiceNumber: -1 });

  let sequence = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

// Create a new billing invoice record for patient services
export const createInvoice = async (req, res) => {
  try {
    const {
      patient,
      patientName,
      patientEmail,
      patientPhone,
      patientId,
      doctor,
      doctorName,
      department,
      appointment,
      services = [],
      discount,
      tax,
      amountPaid,
      paymentMethod,
      invoiceDate,
      dueDate,
      notes,
    } = req.body;

    if (!patient || !patientName) {
      return res.status(400).json({
        success: false,
        message: 'Patient is required',
      });
    }

    const subtotal = services.reduce((sum, service) => {
      const total = (service.quantity || 1) * (service.unitPrice || 0);
      return sum + total;
    }, 0);

    const totalAmount = subtotal - (discount || 0) + (tax || 0);

    const invoiceNumber = await generateInvoiceNumber();
    const currentUserId = req.user?._id || req.user?.id || req.userId;

    const invoice = new Invoice({
      invoiceNumber,
      patient,
      patientName,
      patientEmail,
      patientPhone,
      patientId,
      doctor,
      doctorName,
      department,
      appointment,
      services: services.map((s) => ({
        ...s,
        total: (s.quantity || 1) * (s.unitPrice || 0),
      })),
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      totalAmount,
      amountPaid: amountPaid || 0,
      paymentMethod: paymentMethod || 'Cash',
      invoiceDate: invoiceDate || new Date(),
      dueDate,
      notes,
      createdBy: currentUserId,
    });

    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('patient', 'fullName email phoneNumber')
      .populate('doctor', 'fullName specialization')
      .populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: populatedInvoice,
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message,
    });
  }
};

// Fetch paginated invoices list with optional status and search filters
export const getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status) {
      query.paymentStatus = status;
    }

    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('patient', 'fullName email phoneNumber')
        .populate('doctor', 'fullName specialization')
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Invoice.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message,
    });
  }
};

// Fetch detailed invoice document by ID
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('patient', 'fullName email phoneNumber')
      .populate('doctor', 'fullName specialization')
      .populate('appointment', 'date timeSlot status')
      .populate('createdBy', 'fullName email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message,
    });
  }
};

// Fetch all billing invoices assigned to logged-in patient
export const getPatientInvoices = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;

    const invoices = await Invoice.find({ patient: userId })
      .populate('doctor', 'fullName specialization')
      .populate('appointment', 'date timeSlot')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error('Get patient invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient invoices',
      error: error.message,
    });
  }
};

// Record payment amount updates and recalculate invoice balance status
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentMethod } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    invoice.amountPaid = amountPaid !== undefined ? amountPaid : invoice.amountPaid;
    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.amountPaid);

    if (invoice.balanceDue === 0) {
      invoice.paymentStatus = 'Paid';
    } else if (invoice.balanceDue > 0 && invoice.balanceDue < invoice.totalAmount) {
      invoice.paymentStatus = 'Partially Paid';
    } else {
      invoice.paymentStatus = 'Pending';
    }

    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: invoice,
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message,
    });
  }
};

// Update existing invoice fields and recalculate totals
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    delete updates.invoiceNumber;

    if (updates.services) {
      const subtotal = updates.services.reduce((sum, service) => {
        const total = (service.quantity || 1) * (service.unitPrice || 0);
        return sum + total;
      }, 0);

      updates.subtotal = subtotal;
      updates.totalAmount = subtotal - (updates.discount || invoice.discount || 0) + (updates.tax || invoice.tax || 0);
    }

    if (updates.discount !== undefined || updates.tax !== undefined) {
      const subtotal = updates.subtotal || invoice.subtotal;
      const discount = updates.discount !== undefined ? updates.discount : invoice.discount;
      const tax = updates.tax !== undefined ? updates.tax : invoice.tax;
      updates.totalAmount = subtotal - discount + tax;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    )
      .populate('patient', 'fullName email phoneNumber')
      .populate('doctor', 'fullName specialization')
      .populate('createdBy', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice,
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message,
    });
  }
};

// Permanently delete invoice record by document ID
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByIdAndDelete(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error.message,
    });
  }
};

// Aggregate summary metrics for patient billing dashboard
export const getInvoiceSummary = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;

    const invoices = await Invoice.find({ patient: userId });

    const totalBills = invoices.length;
    const pendingAmount = invoices
      .filter((inv) => inv.paymentStatus === 'Pending' || inv.paymentStatus === 'Partially Paid')
      .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

    const sortedByDate = [...invoices].sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
    const lastBill = sortedByDate[0] || null;

    res.status(200).json({
      success: true,
      data: {
        totalBills,
        pendingAmount,
        lastBillAmount: lastBill ? lastBill.totalAmount : 0,
        lastBillDate: lastBill ? lastBill.invoiceDate : null,
      },
    });
  } catch (error) {
    console.error('Get invoice summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice summary',
      error: error.message,
    });
  }
};