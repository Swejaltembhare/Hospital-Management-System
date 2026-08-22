// controllers/analyticsController.js
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

// ==================== APPOINTMENT TREND ====================
export const getAppointmentTrend = async (req, res) => {
  try {
    // Get last 6 months of appointment data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    
    const appointments = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format data for chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = appointments.map(item => ({
      month: monthNames[item._id.month - 1],
      appointments: item.count
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching appointment trend:', error);
    res.status(500).json({ error: 'Failed to fetch appointment trend' });
  }
};

// ==================== PATIENT REGISTRATION ====================
export const getPatientRegistration = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    
    const patients = await User.aggregate([
      {
        $match: {
          role: 'patient',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = patients.map(item => ({
      month: monthNames[item._id.month - 1],
      patients: item.count
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching patient registration:', error);
    res.status(500).json({ error: 'Failed to fetch patient registration' });
  }
};

// ==================== DEPARTMENT DATA ====================
export const getDepartmentData = async (req, res) => {
  try {
    const departments = await Doctor.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = departments.map(item => ({
      department: item._id || 'Unassigned',
      patients: item.count
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching department data:', error);
    res.status(500).json({ error: 'Failed to fetch department data' });
  }
};

// ==================== APPOINTMENT STATUS ====================
export const getAppointmentStatus = async (req, res) => {
  try {
    const statusData = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'scheduled': 'Scheduled'
    };

    const result = statusData.map(item => ({
      name: statusMap[item._id] || item._id || 'Unknown',
      value: item.count
    }));

    // If no data, return default values
    if (result.length === 0) {
      return res.status(200).json([
        { name: 'Pending', value: 0 },
        { name: 'Confirmed', value: 0 },
        { name: 'Completed', value: 0 },
        { name: 'Cancelled', value: 0 }
      ]);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching appointment status:', error);
    res.status(500).json({ error: 'Failed to fetch appointment status' });
  }
};

// ==================== DOCTOR PERFORMANCE ====================
export const getDoctorPerformance = async (req, res) => {
  try {
    // Get doctor performance data
    const doctors = await Doctor.find()
      .populate('user', 'fullName')
      .limit(10);

    // Get appointment counts for each doctor
    const doctorStats = await Promise.all(
      doctors.map(async (doctor) => {
        const appointmentCount = await Appointment.countDocuments({
          doctorId: doctor._id
        });
        return {
          name: doctor.user?.fullName || 'Unknown',
          patients: appointmentCount || 0,
          appointments: appointmentCount || 0
        };
      })
    );

    // Sort by appointment count descending
    const sorted = doctorStats.sort((a, b) => b.patients - a.patients);
    
    // If no data, return sample data
    if (sorted.length === 0) {
      return res.status(200).json([
        { name: 'No Data', patients: 0, appointments: 0 }
      ]);
    }

    res.status(200).json(sorted);
  } catch (error) {
    console.error('Error fetching doctor performance:', error);
    res.status(500).json({ error: 'Failed to fetch doctor performance' });
  }
};