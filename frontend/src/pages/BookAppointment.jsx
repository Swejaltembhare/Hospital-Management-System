import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaCalendar, FaClock, FaUserMd, FaStethoscope } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    symptoms: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await axios.get(`/api/patients/doctors/${doctorId}`);
      if (response.data.success) {
        setDoctor(response.data.doctor);
        // Generate available slots from doctor's availability
        const slots = response.data.doctor.availableSlots || [];
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.timeSlot) {
      toast.error('Please select date and time');
      return;
    }

    try {
      const response = await axios.post('/api/patients/appointments', {
        doctorId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        symptoms: formData.symptoms
      });

      if (response.data.success) {
        toast.success('Appointment booked successfully!');
        navigate('/patient/appointments');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Doctor not found</h2>
        <p className="text-gray-600 mt-2">The doctor you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Doctor Info */}
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <FaUserMd className="text-blue-600 text-3xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Dr. {doctor.user?.fullName}
              </h2>
              <div className="flex items-center text-gray-600">
                <FaStethoscope className="mr-1" />
                <span>{doctor.specialization}</span>
                <span className="mx-2">•</span>
                <span>{doctor.department}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span>Experience: {doctor.experience} years</span>
                <span className="mx-2">•</span>
                <span>Fee: ₹{doctor.consultationFee}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Book Appointment</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Date *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Time Slot *
              </label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, timeSlot: slot.startTime })}
                    className={`py-2 px-4 rounded-md border ${
                      formData.timeSlot === slot.startTime
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <FaClock className="inline mr-1" />
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
                {availableSlots.length === 0 && (
                  <p className="text-gray-500 col-span-3">No available slots</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Symptoms (Optional)
              </label>
              <textarea
                name="symptoms"
                rows="4"
                value={formData.symptoms}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your symptoms..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/patient/doctors')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
              >
                Book Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;