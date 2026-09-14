// src/components/patient/ExportRecord.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileJson, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ExportRecord = ({ patientId }) => {
  const [loading, setLoading] = useState({ pdf: false, json: false });

  // Handle patient medical record download in PDF or JSON format
  const handleExport = async (format) => {
    setLoading((prev) => ({ ...prev, [format]: true }));
    try {
      const endpoint = `/export/patient/${patientId}/${format}`;

      if (format === 'pdf') {
        const response = await api.get(endpoint, {
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `patient-record-${patientId}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success('PDF exported successfully!');
      } else {
        const response = await api.get(endpoint);
        const data = response.data?.data || response.data;
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `patient-record-${patientId}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success('JSON exported successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export patient record');
    } finally {
      setLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* PDF Export Download Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleExport('pdf')}
        disabled={loading.pdf}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
      >
        {loading.pdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        {loading.pdf ? 'Exporting...' : 'Export PDF'}
      </motion.button>

      {/* JSON Export Download Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleExport('json')}
        disabled={loading.json}
        className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
      >
        {loading.json ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileJson className="w-4 h-4" />
        )}
        {loading.json ? 'Exporting...' : 'Export JSON'}
      </motion.button>
    </div>
  );
};

export default ExportRecord;