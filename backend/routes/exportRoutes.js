import express from 'express';
import {
  exportPatientJSON,
  exportPatientPDF,
} from '../controllers/exportController.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLog.js';

const router = express.Router();

// Convert dynamic object arrays into clean CSV string output
const convertToCSV = (items, headers) => {
  if (!items || !items.length) return '';

  const csvRows = [];

  csvRows.push(headers.map((h) => `"${h.label}"`).join(','));

  for (const item of items) {
    const values = headers.map((h) => {
      let val = h.key.split('.').reduce((acc, part) => acc && acc[part], item);
      if (val === undefined || val === null) val = '';
      if (val instanceof Date) val = val.toISOString().split('T')[0];
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

// Process bulk CSV file download generation for specified entity collection
const handleCSVExport = async (req, res) => {
  try {
    const type = req.params.type ? req.params.type.toLowerCase() : 'users';
    let data = [];
    let headers = [];

    if (type === 'doctors') {
      data = await User.find({ role: 'doctor' }).select('-password').lean();
      headers = [
        { label: 'User ID', key: '_id' },
        { label: 'Full Name', key: 'fullName' },
        { label: 'Email', key: 'email' },
        { label: 'Phone Number', key: 'phoneNumber' },
        { label: 'Role', key: 'role' },
        { label: 'Created At', key: 'createdAt' },
      ];
    } else if (type === 'patients') {
      data = await User.find({ role: 'patient' }).select('-password').lean();
      headers = [
        { label: 'Patient ID', key: '_id' },
        { label: 'Full Name', key: 'fullName' },
        { label: 'Email', key: 'email' },
        { label: 'Phone Number', key: 'phoneNumber' },
        { label: 'Created At', key: 'createdAt' },
      ];
    } else if (type === 'appointments') {
      data = await Appointment.find()
        .populate({
          path: 'patient',
          populate: { path: 'user', select: 'fullName email' },
        })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'fullName department' },
        })
        .lean();

      headers = [
        { label: 'Appointment ID', key: '_id' },
        { label: 'Patient Name', key: 'patient.user.fullName' },
        { label: 'Doctor Name', key: 'doctor.user.fullName' },
        { label: 'Date', key: 'date' },
        { label: 'Time Slot', key: 'timeSlot' },
        { label: 'Status', key: 'status' },
      ];
    } else {
      data = await User.find().select('-password').lean();
      headers = [
        { label: 'ID', key: '_id' },
        { label: 'Full Name', key: 'fullName' },
        { label: 'Email', key: 'email' },
        { label: 'Phone Number', key: 'phoneNumber' },
        { label: 'Role', key: 'role' },
        { label: 'Status', key: 'isActive' },
      ];
    }

    const csvData = convertToCSV(data, headers);
    const filename = `hospital-${type}-export-${Date.now()}.csv`;

    await logAudit(
      req,
      'EXPORT',
      'USER',
      '',
      `${type.toUpperCase()}_CSV_EXPORT`,
      `Exported ${type} data in CSV format`
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSV export',
      error: error.message,
    });
  }
};

// Enforce authentication and administrative authorization on data export routes
router.use(authenticate);
router.use(authorize('admin'));

// Single patient data export endpoints
router.get('/patient/:patientId/json', exportPatientJSON);
router.get('/patient/:patientId/pdf', exportPatientPDF);

// System CSV bulk download export endpoints
router.get('/', handleCSVExport);
router.get('/:type', handleCSVExport);

export default router;