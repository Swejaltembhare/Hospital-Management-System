// src/components/admin/DashboardCards.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Stethoscope, 
  Building2, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const DashboardCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      color: 'blue',
      trend: 12,
      trendDirection: 'up'
    },
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: Users,
      color: 'green',
      trend: 8,
      trendDirection: 'up'
    },
    {
      title: 'Total Departments',
      value: stats?.totalDepartments || 0,
      icon: Building2,
      color: 'purple',
      trend: 0,
      trendDirection: 'neutral'
    },
    {
      title: 'Total Appointments',
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: 'indigo',
      trend: 15,
      trendDirection: 'up'
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      icon: Clock,
      color: 'orange',
      trend: 5,
      trendDirection: 'up'
    },
    {
      title: 'Pending Appointments',
      value: stats?.pendingAppointments || 0,
      icon: Activity,
      color: 'yellow',
      trend: -3,
      trendDirection: 'down'
    },
    {
      title: 'Completed Appointments',
      value: stats?.completedAppointments || 0,
      icon: CheckCircle,
      color: 'green',
      trend: 20,
      trendDirection: 'up'
    },
    {
      title: 'Cancelled Appointments',
      value: stats?.cancelledAppointments || 0,
      icon: XCircle,
      color: 'red',
      trend: -2,
      trendDirection: 'down'
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const TrendIcon = ({ direction }) => {
    if (direction === 'up') return <TrendingUp size={16} />;
    if (direction === 'down') return <TrendingDown size={16} />;
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {card.value.toLocaleString()}
              </p>
              {card.trend !== 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendIcon direction={card.trendDirection} />
                  <span className={`text-sm font-medium ${trendColors[card.trendDirection]}`}>
                    {Math.abs(card.trend)}%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${colorClasses[card.color]}`}>
              <card.icon size={24} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardCards;