import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import { logAudit } from '../middleware/auditLog.js';

// Query combined patient details, appointment history, and medical prescriptions
const getPatientRecordData = async (patientId) => {
  const [patient, appointments, prescriptions] = await Promise.all([
    Patient.findById(patientId).populate('user', 'fullName email phoneNumber'),
    Appointment.find({ patient: patientId })
      .populate('doctor', 'specialization department')
      .populate('doctor.user', 'fullName')
      .sort({ date: -1 }),
    Prescription.find({ patient: patientId })
      .populate('doctor', 'specialization')
      .populate('doctor.user', 'fullName')
      .sort({ prescribedDate: -1 }),
  ]);

  return { patient, appointments, prescriptions };
};

// Export structured patient record as JSON payload
export const exportPatientJSON = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user?._id || req.user?.id || req.userId;
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      const patient = await Patient.findOne({ user: userId });
      if (!patient || patient._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    const data = await getPatientRecordData(patientId);
    if (!data.patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      patient: {
        id: data.patient._id,
        name: data.patient.user?.fullName || 'N/A',
        email: data.patient.user?.email || 'N/A',
        phone: data.patient.user?.phoneNumber || 'N/A',
        dateOfBirth: data.patient.dateOfBirth || 'N/A',
        gender: data.patient.gender || 'N/A',
        bloodGroup: data.patient.bloodGroup || 'N/A',
      },
      appointments: data.appointments.map((a) => ({
        id: a._id,
        doctor: a.doctor?.user?.fullName || 'N/A',
        department: a.doctor?.department || 'N/A',
        date: a.date,
        timeSlot: a.timeSlot,
        status: a.status,
        type: a.appointmentType || 'In-Person',
      })),
      prescriptions: data.prescriptions.map((p) => ({
        id: p._id,
        doctor: p.doctor?.user?.fullName || 'N/A',
        medicines: p.medicines || [],
        diagnosis: p.diagnosis || 'N/A',
        prescribedDate: p.prescribedDate,
        isActive: p.isActive,
      })),
    };

    await logAudit(
      req,
      'EXPORT',
      'PATIENT',
      patientId,
      `Patient record exported as JSON`,
      `Patient: ${data.patient.user?.fullName || 'N/A'}`
    );

    res.status(200).json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('Export JSON error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export patient record',
      error: error.message,
    });
  }
};

// Generate and export printable HTML/PDF patient medical document
export const exportPatientPDF = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user?._id || req.user?.id || req.userId;
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      const patient = await Patient.findOne({ user: userId });
      if (!patient || patient._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    const data = await getPatientRecordData(patientId);
    if (!data.patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Patient Record - ${data.patient.user?.fullName || 'Patient'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1a202c; }
          .header { text-align: center; border-bottom: 3px solid #0D9488; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #0D9488; margin: 0; }
          .header p { color: #718096; margin: 5px 0; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #0D9488; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-item { padding: 8px 0; }
          .info-item strong { color: #4a5568; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f7fafc; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-confirmed { background: #cffafe; color: #0e7490; }
          .status-completed { background: #d1fae5; color: #065f46; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          .footer { text-align: center; border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 30px; color: #a0aec0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MediCare Hospital</h1>
          <p>Patient Medical Record</p>
          <p style="font-size: 14px;">Generated: ${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div class="section">
          <h2>Patient Information</h2>
          <div class="info-grid">
            <div class="info-item"><strong>Name:</strong> ${data.patient.user?.fullName || 'N/A'}</div>
            <div class="info-item"><strong>Patient ID:</strong> ${data.patient._id || 'N/A'}</div>
            <div class="info-item"><strong>Email:</strong> ${data.patient.user?.email || 'N/A'}</div>
            <div class="info-item"><strong>Phone:</strong> ${data.patient.user?.phoneNumber || 'N/A'}</div>
            <div class="info-item"><strong>Date of Birth:</strong> ${data.patient.dateOfBirth ? new Date(data.patient.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
            <div class="info-item"><strong>Gender:</strong> ${data.patient.gender || 'N/A'}</div>
            <div class="info-item"><strong>Blood Group:</strong> ${data.patient.bloodGroup || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <h2>Appointments</h2>
          ${
            data.appointments.length === 0
              ? '<p>No appointments found.</p>'
              : `
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.appointments
                .map(
                  (a) => `
                <tr>
                  <td>${a.doctor?.user?.fullName || 'N/A'}</td>
                  <td>${new Date(a.date).toLocaleDateString()}</td>
                  <td>${a.timeSlot}</td>
                  <td><span class="status-badge status-${a.status}">${a.status}</span></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          `
          }
        </div>

        <div class="section">
          <h2>Prescriptions</h2>
          ${
            data.prescriptions.length === 0
              ? '<p>No prescriptions found.</p>'
              : data.prescriptions
                  .map(
                    (p) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
              <p><strong>Doctor:</strong> ${p.doctor?.user?.fullName || 'N/A'}</p>
              <p><strong>Diagnosis:</strong> ${p.diagnosis || 'N/A'}</p>
              <p><strong>Prescribed:</strong> ${new Date(p.prescribedDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${p.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Medicines:</strong></p>
              <ul>
                ${p.medicines.map((m) => `<li>${m.name} - ${m.dosage} (${m.frequency})</li>`).join('')}
              </ul>
            </div>
          `
                  )
                  .join('')
          }
        </div>

        <div class="footer">
          <p>This is a computer-generated document. No signature required.</p>
          <p>MediCare Hospital Management System</p>
        </div>
      </body>
      </html>
    `;

    await logAudit(
      req,
      'EXPORT',
      'PATIENT',
      patientId,
      `Patient record exported as PDF`,
      `Patient: ${data.patient.user?.fullName || 'N/A'}`
    );

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=patient-record-${patientId}.html`);
    res.send(html);
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export patient record as PDF',
      error: error.message,
    });
  }
};