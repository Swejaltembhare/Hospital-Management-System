// src/components/admin/DoctorOverview.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Clock, 
  Calendar, 
  CheckCircle,
  Star,
  Phone,
  MapPin
} from 'lucide-react';

const DoctorOverview = ({ doctors }) => {
  const defaultDoctors = [
    {
      id: 1,
      name: 'Dr. John Smith',
      department: 'Cardiology',
      experience: 12,
      fee: 800,
      patients: 15,
      availability: 'Available',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      department: 'Neurology',
      experience: 8,
      fee: 700,
      patients: 12,
      availability: 'In Consultation',
      rating: 4.6
    },
    {
      id: 3,
      name: 'Dr. Michael Brown',
      department: 'Orthopedics',
      experience: 15,
      fee: 900,
      patients: 18,
      availability: 'Available',
      rating: 4.9
    },
  ];

  const doctorList = doctors?.length > 0 ? doctors : defaultDoctors;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Doctor Overview</h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {doctorList.map((doctor, index) => (
          <motion.div
            key={doctor.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {doctor.name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">{doctor.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    doctor.availability === 'Available' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {doctor.availability || 'Available'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Stethoscope size={12} />
                  {doctor.department || 'General Medicine'}
                </p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                  <span>{doctor.experience || 0} years exp.</span>
                  <span>₹{doctor.fee || 500}</span>
                  <span className="flex items-center gap-0.5">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    {doctor.rating || 4.5}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Calendar size={12} />
                    {doctor.patients || 0} today
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DoctorOverview;