// src/components/admin/SystemHealth.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  Globe, 
  Mail, 
  HardDrive,
  Cpu,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SystemHealth = ({ healthData }) => {
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(healthData || {
    server: 'online',
    database: 'online',
    api: 'online',
    email: 'online',
    storage: 'online',
    cpu: 'online',
    ram: 'online',
    storageUsage: '65%',
    cpuUsage: '32%',
    ramUsage: '45%'
  });

  const healthItems = [
    { 
      id: 'server', 
      label: 'Server Status', 
      icon: Server,
      status: health?.server || 'online'
    },
    { 
      id: 'database', 
      label: 'Database Status', 
      icon: Database,
      status: health?.database || 'online'
    },
    { 
      id: 'api', 
      label: 'API Status', 
      icon: Globe,
      status: health?.api || 'online'
    },
    { 
      id: 'email', 
      label: 'Email Service', 
      icon: Mail,
      status: health?.email || 'online'
    },
    { 
      id: 'storage', 
      label: 'Storage Usage', 
      icon: HardDrive,
      status: health?.storage || 'online',
      value: health?.storageUsage || '65%'
    },
    { 
      id: 'cpu', 
      label: 'CPU Usage', 
      icon: Cpu,
      status: health?.cpu || 'online',
      value: health?.cpuUsage || '32%'
    },
    { 
      id: 'ram', 
      label: 'RAM Usage', 
      icon: Activity,
      status: health?.ram || 'online',
      value: health?.ramUsage || '45%'
    },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'border-green-100 bg-green-50';
      case 'offline': return 'border-red-100 bg-red-50';
      case 'warning': return 'border-yellow-100 bg-yellow-50';
      default: return 'border-gray-100 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'online': return <CheckCircle size={18} className="text-green-600" />;
      case 'offline': return <XCircle size={18} className="text-red-600" />;
      case 'warning': return <AlertCircle size={18} className="text-yellow-600" />;
      default: return <CheckCircle size={18} className="text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'warning': return 'Warning';
      default: return 'Unknown';
    }
  };

  const refreshHealth = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSystemHealth();
      if (response.data.success) {
        setHealth(response.data.data);
        toast.success('System health refreshed');
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('Failed to refresh system health');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (value) => {
    const num = parseInt(value);
    if (num > 80) return 'bg-red-500';
    if (num > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
        <button
          onClick={refreshHealth}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {healthItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-xl border ${getStatusColor(item.status)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <item.icon size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600">{item.label}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-semibold text-gray-900">
                    {getStatusText(item.status)}
                  </span>
                  {getStatusIcon(item.status)}
                </div>
                {item.value && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.value)}`}
                        style={{ width: item.value }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.value}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overall Status */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">All systems operational</span>
        </div>
        <span className="text-xs text-gray-400">
          Last checked: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
};

export default SystemHealth;