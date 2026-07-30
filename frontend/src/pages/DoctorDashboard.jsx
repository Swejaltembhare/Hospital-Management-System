import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaCalendarCheck, FaUserMd, FaStar, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    averageRating: 0,
    totalPatients: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, patientsRes, ratingsRes] = await Promise.all([
        axios.get('/api/doctors/appointments'),
        axios.get('/api/doctors/patients'),
        axios.get('/api/doctors/ratings')
      ]);

      const appointments = appointmentsRes.data.appointments || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const todayApts = appointments.filter(apt => 
        new Date(apt.date).toISOString().split('T')[0] === todayStr
      );

      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayApts.length,
        pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        averageRating: ratingsRes.data.averageRating || 0,
        totalPatients: patientsRes.data.patients?.length || 0
      });

      setTodayAppointments(todayApts.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, Dr. {user?.fullName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your appointments and patients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-blue-600">{stats.todayAppointments}</p>
            </div>
            <FaCalendarCheck className="text-blue-500 text-3xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalPatients}</p>
            </div>
            <FaUserMd className="text-green-500 text-3xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Appointments</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
            </div>
            <FaClock className="text-yellow-500 text-3xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-purple-600">{stats.averageRating || 0} ★</p>
            </div>
            <FaStar className="text-purple-500 text-3xl" />
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => (
              <div key={appointment._id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {appointment.patient?.fullName || 'Unknown Patient'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Time: {appointment.timeSlot}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  <button
                    onClick={() => {/* Navigate to appointment details */}}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              No appointments for today
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;