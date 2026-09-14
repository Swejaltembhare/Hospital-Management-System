import LabTest from '../models/LabTest.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { logAudit } from '../middleware/auditLog.js';

// Order new lab test for patient by attending doctor
export const createLabTest = async (req, res) => {
  try {
    const { patientId, testName, testType, priority, notes } = req.body;
    const userId = req.user?._id || req.user?.id || req.userId;

    if (!patientId || !testName) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and test name are required',
      });
    }

    const patient = await Patient.findById(patientId).populate('user', 'fullName');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    const labTest = new LabTest({
      patient: patientId,
      doctor: doctor._id,
      testName,
      testType: testType || 'Lab',
      priority: priority || 'Routine',
      notes,
      status: 'Pending',
      createdBy: userId,
    });

    await labTest.save();

    await logAudit(
      req,
      'CREATE',
      'LAB_TEST',
      labTest._id,
      `Lab test ordered: ${testName}`,
      `Patient: ${patient.user?.fullName || 'N/A'}`
    );

    res.status(201).json({
      success: true,
      message: 'Lab test ordered successfully',
      data: labTest,
    });
  } catch (error) {
    console.error('Create lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to order lab test',
      error: error.message,
    });
  }
};

// Retrieve paginated list of all lab tests with status and patient filters
export const getAllLabTests = async (req, res) => {
  try {
    const { status, patientId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (patientId) filter.patient = patientId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tests, total] = await Promise.all([
      LabTest.find(filter)
        .populate({
          path: 'patient',
          populate: { path: 'user', select: 'fullName email phoneNumber' },
        })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'fullName' },
        })
        .sort({ orderedDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      LabTest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: tests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests',
      error: error.message,
    });
  }
};

// Retrieve single lab test details ensuring patient ownership or staff authorization
export const getLabTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id || req.userId;
    const userRole = req.user?.role || req.userRole;

    const labTest = await LabTest.findById(id)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'fullName email phoneNumber' },
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'fullName department' },
      });

    if (!labTest) {
      return res.status(404).json({ success: false, message: 'Lab test not found' });
    }

    if (userRole === 'patient') {
      const patient = await Patient.findOne({ user: userId });
      if (!patient || labTest.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.status(200).json({ success: true, data: labTest });
  } catch (error) {
    console.error('Get lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab test details',
      error: error.message,
    });
  }
};

// Retrieve all lab test orders for currently authenticated patient
export const getPatientLabTests = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    const tests = await LabTest.find({ patient: patient._id })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'fullName' },
      })
      .sort({ orderedDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    console.error('Get patient lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests',
      error: error.message,
    });
  }
};

// Update processing status and notes for specific lab test order
export const updateLabTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, result, resultFile, notes } = req.body;

    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found',
      });
    }

    labTest.status = status || labTest.status;
    if (result) labTest.result = result;
    if (resultFile) labTest.resultFile = resultFile;
    if (notes) labTest.notes = notes;

    if (status === 'Completed') {
      labTest.completedDate = new Date();
    }

    await labTest.save();

    await logAudit(
      req,
      'UPDATE',
      'LAB_TEST',
      labTest._id,
      `Lab test ${status}`,
      `Test: ${labTest.testName}`
    );

    res.status(200).json({
      success: true,
      message: 'Lab test updated successfully',
      data: labTest,
    });
  } catch (error) {
    console.error('Update lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lab test',
      error: error.message,
    });
  }
};

// Save completed lab test results and uploaded report files
export const uploadLabResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { result, notes } = req.body;
    const fileUrl = req.file?.path || req.body.fileUrl;

    const labTest = await LabTest.findById(id).populate({
      path: 'patient',
      populate: { path: 'user', select: 'fullName' },
    });

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found',
      });
    }

    labTest.result = result || labTest.result;
    labTest.resultFile = fileUrl || labTest.resultFile;
    labTest.notes = notes || labTest.notes;
    labTest.status = 'Completed';
    labTest.completedDate = new Date();

    await labTest.save();

    await logAudit(
      req,
      'UPDATE',
      'LAB_TEST',
      labTest._id,
      `Lab result uploaded for ${labTest.testName}`,
      `Patient: ${labTest.patient?.user?.fullName || 'N/A'}`
    );

    res.status(200).json({
      success: true,
      message: 'Lab result uploaded successfully',
      data: labTest,
    });
  } catch (error) {
    console.error('Upload lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload lab result',
      error: error.message,
    });
  }
};