// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
// import axios from 'axios'; // ✅ REMOVED - using adminAPI instead
import toast from 'react-hot-toast';
import {
  Users,
  UserCircle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Stethoscope,
  Building2,
  FileText,
  Pill
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import DashboardCards from '../../components/admin/DashboardCards';
import Analytics from '../../components/admin/Analytics';
// import RecentActivity from '../../components/admin/RecentActivity'; // ✅ COMMENTED - API not ready
// import AppointmentTable from '../../components/admin/AppointmentTable'; // ✅ COMMENTED - API not ready
import QuickActions from '../../components/admin/QuickActions';
import DoctorOverview from '../../components/admin/DoctorOverview';
import PatientOverview from '../../components/admin/PatientOverview';
// import SystemHealth from '../../components/admin/SystemHealth'; // ✅ COMMENTED - API not ready
import LoadingSkeleton from '../../components/admin/LoadingSkeleton';
import { adminAPI } from '../../services/api'; // ✅ ADDED

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ UPDATED: Using adminAPI instead of axios
      const [statsRes, doctorsRes, patientsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getDoctors({ limit: 5 }),
        adminAPI.getPatients({ limit: 5 }),
      ]);

      // ✅ UPDATED: Setting data from API response
      setStats(statsRes.data.stats || statsRes.data);
      setDoctors(doctorsRes.data.doctors || doctorsRes.data);
      setPatients(patientsRes.data.patients || patientsRes.data);
      
      // ✅ TEMPORARILY SET TO EMPTY ARRAYS
      setRecentActivities([]);
      setAppointments([]);
      setSystemHealth(null);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // ✅ Set default values on error
      setStats({
        totalDoctors: 0,
        totalPatients: 0,
        totalDepartments: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0
      });
      setDoctors([]);
      setPatients([]);
      setRecentActivities([]);
      setAppointments([]);
      setSystemHealth(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const statCards = [
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      color: 'blue',
      trend: 12,
      trendDirection: 'up',
    },
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: Users,
      color: 'green',
      trend: 8,
      trendDirection: 'up',
    },
    {
      title: 'Total Departments',
      value: stats?.totalDepartments || 0,
      icon: Building2,
      color: 'purple',
      trend: 0,
      trendDirection: 'neutral',
    },
    {
      title: 'Total Appointments',
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: 'indigo',
      trend: 15,
      trendDirection: 'up',
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      icon: Clock,
      color: 'orange',
      trend: 5,
      trendDirection: 'up',
    },
    {
      title: 'Pending Appointments',
      value: stats?.pendingAppointments || 0,
      icon: Activity,
      color: 'yellow',
      trend: -3,
      trendDirection: 'down',
    },
    {
      title: 'Completed Appointments',
      value: stats?.completedAppointments || 0,
      icon: CheckCircle,
      color: 'green',
      trend: 20,
      trendDirection: 'up',
    },
    {
      title: 'Cancelled Appointments',
      value: stats?.cancelledAppointments || 0,
      icon: XCircle,
      color: 'red',
      trend: -2,
      trendDirection: 'down',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.fullName || 'Admin'}! 👋
            </h1>
            <p className="mt-1 text-blue-100">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-blue-100 text-sm mt-2">
              MediCare Hospital Management System
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{new Date().toLocaleTimeString()}</p>
              <p className="text-xs text-blue-100">Current Time</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Analytics */}
      <Analytics />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* ✅ COMMENTED - API not ready */}
          {/* <RecentActivity activities={recentActivities} /> */}
          
          {/* ✅ TEMPORARY PLACEHOLDER */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="text-center text-gray-500 py-8">
              <Activity size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Recent activities will appear here</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <DoctorOverview doctors={doctors} />
        </div>
      </div>

      {/* ✅ COMMENTED - API not ready */}
      {/* <AppointmentTable appointments={appointments} /> */}

      {/* Quick Actions and Patient Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <PatientOverview patients={patients} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;