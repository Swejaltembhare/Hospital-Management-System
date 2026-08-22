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
  RefreshCw,
  Wifi,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const SystemHealth = () => {
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const fetchSystemHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/system/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }

      const data = await response.json();
      setHealth(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
      setError('Failed to fetch system health status');
      toast.error('Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  const healthItems = [
    { 
      id: 'server', 
      label: 'Server Status', 
      icon: Server,
      status: health?.server?.status || 'unknown',
      message: health?.server?.message || ''
    },
    { 
      id: 'database', 
      label: 'Database', 
      icon: Database,
      status: health?.database?.status || 'unknown',
      message: health?.database?.message || '',
      value: health?.database?.responseTime ? `${health.database.responseTime}ms` : null
    },
    { 
      id: 'api', 
      label: 'API Service', 
      icon: Globe,
      status: health?.api?.status || 'unknown',
      message: health?.api?.message || '',
      value: health?.api?.responseTime ? `${health.api.responseTime}ms` : null
    },
    { 
      id: 'email', 
      label: 'Email Service', 
      icon: Mail,
      status: health?.email?.status || 'unknown',
      message: health?.email?.message || ''
    },
    { 
      id: 'storage', 
      label: 'Storage', 
      icon: HardDrive,
      status: health?.storage?.status || 'unknown',
      value: health?.storage?.usage || '0%',
      used: health?.storage?.used || '0 GB',
      total: health?.storage?.total || '0 GB'
    },
    { 
      id: 'cpu', 
      label: 'CPU Usage', 
      icon: Cpu,
      status: health?.cpu?.status || 'unknown',
      value: health?.cpu?.usage || '0%'
    },
    { 
      id: 'ram', 
      label: 'RAM Usage', 
      icon: Activity,
      status: health?.ram?.status || 'unknown',
      value: health?.ram?.usage || '0%'
    },
    { 
      id: 'network', 
      label: 'Network', 
      icon: Wifi,
      status: health?.network?.status || 'unknown',
      value: health?.network?.latency ? `${health.network.latency}ms` : null
    },
  ];

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'operational':
        return 'border-green-100 bg-green-50';
      case 'offline':
      case 'down':
      case 'error':
        return 'border-red-100 bg-red-50';
      case 'warning':
      case 'degraded':
        return 'border-yellow-100 bg-yellow-50';
      case 'unknown':
      default:
        return 'border-gray-100 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'operational':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'offline':
      case 'down':
      case 'error':
        return <XCircle size={18} className="text-red-600" />;
      case 'warning':
      case 'degraded':
        return <AlertCircle size={18} className="text-yellow-600" />;
      case 'unknown':
      default:
        return <AlertCircle size={18} className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch(status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'operational':
        return 'Online';
      case 'offline':
      case 'down':
      case 'error':
        return 'Offline';
      case 'warning':
      case 'degraded':
        return 'Warning';
      case 'unknown':
      default:
        return 'Unknown';
    }
  };

  const getProgressColor = (value) => {
    const num = parseInt(value);
    if (isNaN(num)) return 'bg-green-500';
    if (num > 80) return 'bg-red-500';
    if (num > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getOverallStatus = () => {
    if (!health) return 'unknown';
    const items = healthItems;
    const hasOffline = items.some(item => 
      ['offline', 'down', 'error'].includes(item.status?.toLowerCase())
    );
    const hasWarning = items.some(item => 
      ['warning', 'degraded'].includes(item.status?.toLowerCase())
    );
    
    if (hasOffline) return 'offline';
    if (hasWarning) return 'warning';
    return 'operational';
  };

  const overallStatus = getOverallStatus();
  const overallStatusText = {
    operational: 'All systems operational',
    warning: 'Some systems are degraded',
    offline: 'Some systems are offline',
    unknown: 'Checking system status...'
  };

  if (loading && !health) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-200 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-3 text-red-400" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchSystemHealth}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Shield size={20} className="text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
            <p className="text-xs text-gray-500">
              {overallStatusText[overallStatus] || 'Checking system status...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            overallStatus === 'operational' ? 'bg-green-500' :
            overallStatus === 'warning' ? 'bg-yellow-500' :
            overallStatus === 'offline' ? 'bg-red-500' :
            'bg-gray-500'
          }`}></div>
          <button
            onClick={fetchSystemHealth}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {healthItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(index * 0.05, 0.5) }}
            className={`p-4 rounded-xl border ${getStatusColor(item.status)} hover:shadow-md transition-shadow`}
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
                {item.message && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{item.message}</p>
                )}
                {item.value && item.id !== 'storage' && (
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
                {item.id === 'storage' && item.value && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.value)}`}
                        style={{ width: item.value }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.used} / {item.total} ({item.value})
                    </p>
                  </div>
                )}
                {item.id === 'ram' && item.value && (
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

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            overallStatus === 'operational' ? 'bg-green-500' :
            overallStatus === 'warning' ? 'bg-yellow-500' :
            overallStatus === 'offline' ? 'bg-red-500' :
            'bg-gray-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {overallStatusText[overallStatus] || 'Checking system status...'}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
};

export default SystemHealth;