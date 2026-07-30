// src/components/admin/PatientOverview.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Phone, 
  Mail,
  User,
  Clock
} from 'lucide-react';

const PatientOverview = ({ patients }) => {
  const defaultPatients = [
    {
      id: 1,
      name: 'Alice Johnson',
      age: 34,
      gender: 'Female',
      phoneNumber: '+1 234 567 890',
      registered: '2024-12-20'
    },
    {
      id: 2,
      name: 'Robert Davis',
      age: 45,
      gender: 'Male',
      phoneNumber: '+1 234 567 891',
      registered: '2024-12-19'
    },
    {
      id: 3,
      name: 'Emily Wilson',
      age: 28,
      gender: 'Female',
      phoneNumber: '+1 234 567 892',
      registered: '2024-12-18'
    },
  ];

  const patientList = patients?.length > 0 ? patients : defaultPatients;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Latest Patients</h3>
        <span className="text-xs text-blue-600 font-medium">View All</span>
      </div>
      <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
        {patientList.map((patient, index) => (
          <motion.div
            key={patient.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {patient.name?.charAt(0) || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">{patient.name}</h4>
                  <span className="text-xs text-gray-500">{patient.age || 30} yrs</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {patient.gender || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={12} />
                    {patient.phoneNumber || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {patient.registered ? new Date(patient.registered).toLocaleDateString() : 'Today'}
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

export default PatientOverview;