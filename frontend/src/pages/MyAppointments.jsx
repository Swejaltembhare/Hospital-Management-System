import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaCalendar, FaClock, FaUserMd, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const endpoint = user?.role === 'patient' 
        ? '/api/patients/appointments' 
        : '/api/doctors/appointments';
      const response = await axios.get(endpoint);
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await axios.put(`/api/patients/appointments/${appointmentId}/cancel`);
      if (response.data.success) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const response = await axios.put(`/api/doctors/appointments/${appointmentId}/status`, { status });
      if (response.data.success) {
        toast.success(`Appointment ${status} successfully`);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FaUserMd className="text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user?.role === 'patient' 
                        ? `Dr. ${appointment.doctor?.user?.fullName || 'Unknown'}`
                        : appointment.patient?.fullName || 'Unknown Patient'}
                    </h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FaCalendar className="mr-1" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" />
                      {appointment.timeSlot}
                    </span>
                    {user?.role === 'patient' && (
                      <span className="flex items-center">
                        <FaUserMd className="mr-1" />
                        {appointment.doctor?.specialization || 'General'}
                      </span>
                    )}
                  </div>

                  {appointment.symptoms && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                  {user?.role === 'patient' && appointment.status === 'pending' && (
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                    >
                      <FaTimes className="mr-1" />
                      Cancel
                    </button>
                  )}
                  
                  {user?.role === 'doctor' && appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                      >
                        <FaCheck className="mr-1" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                      >
                        <FaTimes className="mr-1" />
                        Cancel
                      </button>
                    </>
                  )}

                  {user?.role === 'doctor' && appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                    >
                      <FaCheck className="mr-1" />
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No appointments found</p>
            {user?.role === 'patient' && (
              <button
                onClick={() => window.location.href = '/patient/doctors'}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
              >
                Book an Appointment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;