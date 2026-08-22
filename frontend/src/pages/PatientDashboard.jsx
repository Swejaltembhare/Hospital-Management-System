// src/pages/PatientDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
  Activity,
  CheckCircle,
  XCircle,
  Heart,
  Pill,
  Phone,
  Video,
  MapPin,
  Building,
  Award,
  Download,
  Eye,
  Ambulance,
  PhoneCall,
  HeartPulse,
  Sparkles,
  MessageSquare,
  Stethoscope,
  Search,
  Filter,
  Users,
  RefreshCw,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// ==================== COMMON COMPONENTS ====================

const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    confirmed: { color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: CalendarCheck },
    completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    cancelled: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  };
  const current = statusMap[status?.toLowerCase()] || statusMap.pending;
  const StatusIcon = current.icon;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${current.color}`}>
      <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
    </span>
  );
};

// ==================== PATIENT DASHBOARD ====================

const PatientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    pendingReports: 0,
    activePrescriptions: 0,
  });
  const [nextAppointment, setNextAppointment] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState({
    bmi: null,
    bloodPressure: null,
    heartRate: null,
    sugarLevel: null,
  });
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [healthScore, setHealthScore] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [
        appointmentsRes,
        medicationsRes,
        metricsRes,
        emergencyRes,
        scoreRes,
      ] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/patients/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/patients/medications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/patients/health-metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/patients/emergency-contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/patients/health-score`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const appointments = appointmentsRes.data.appointments || [];
      const now = new Date();
      const upcoming = appointments.filter(
        (apt) => new Date(apt.date) >= now && apt.status === 'confirmed'
      );
      const completed = appointments.filter((apt) => apt.status === 'completed');

      const next = upcoming.length > 0 ? upcoming[0] : null;

      setStats({
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        pendingReports: appointments.filter((apt) => apt.status === 'pending').length || 0,
        activePrescriptions: medicationsRes.data.activePrescriptions || 0,
      });

      setNextAppointment(next);
      setRecentAppointments(appointments.slice(0, 5));
      setMedications(medicationsRes.data.medications || []);
      setHealthMetrics(metricsRes.data || {});
      setEmergencyContacts(emergencyRes.data.contacts || []);
      setHealthScore(scoreRes.data.score || null);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-teal-50/30 pb-12">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6">
        <WelcomeSection 
          user={user} 
          getGreeting={getGreeting} 
          healthScore={healthScore}
          nextAppointmentCount={stats.upcomingAppointments}
        />

        <HealthStats stats={stats} />
        <QuickActions />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-8">
          <div className="xl:col-span-7 2xl:col-span-8 space-y-6">
            <NextAppointmentCard appointment={nextAppointment} />
            <RecentAppointments appointments={recentAppointments} />
          </div>

          <div className="xl:col-span-5 2xl:col-span-4 space-y-6">
            <MedicationCard medications={medications} />
            <HealthMetrics metrics={healthMetrics} />
            <EmergencyContact contacts={emergencyContacts} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Skeleton
const DashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-teal-50/30 py-6 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-[1920px] mx-auto space-y-6 animate-pulse">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-3xl p-8 h-44"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 h-28 shadow-sm"></div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 h-20 shadow-sm"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 h-80 shadow-sm"></div>
          <div className="bg-white rounded-3xl p-6 h-64 shadow-sm"></div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 h-48 shadow-sm"></div>
          <div className="bg-white rounded-3xl p-6 h-48 shadow-sm"></div>
        </div>
      </div>
    </div>
  </div>
);

// Welcome Section
const WelcomeSection = ({ user, getGreeting, healthScore, nextAppointmentCount }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="relative mb-8"
  >
    <div className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl shadow-teal-600/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Patient'}! 👋
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm lg:text-base">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-teal-200/80 text-xs sm:text-sm italic mt-1">
            "Your health is your greatest wealth. Stay healthy, stay happy!"
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-300" />
            <div>
              <p className="text-white text-base font-bold leading-none">
                {healthScore || '--'}%
              </p>
              <p className="text-[11px] text-teal-200">Health Score</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-white text-base font-bold leading-none">
                {nextAppointmentCount || 0}
              </p>
              <p className="text-[11px] text-teal-200">Upcoming</p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-300" />
            <div>
              <p className="text-white text-base font-bold leading-none">Today</p>
              <p className="text-[11px] text-teal-200">Last Login</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Health Stats
const HealthStats = ({ stats }) => {
  const statItems = [
    {
      icon: CalendarCheck,
      label: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      color: 'text-cyan-600 bg-cyan-50',
    },
    {
      icon: CheckCircle,
      label: 'Completed Consults',
      value: stats.completedAppointments,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: FileText,
      label: 'Pending Reports',
      value: stats.pendingReports,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      icon: Pill,
      label: 'Active Prescriptions',
      value: stats.activePrescriptions,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 * (index + 1) }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100/80"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Quick Actions
const QuickActions = () => {
  const actions = [
    { 
      to: '/patient/emergency', 
      icon: Phone, 
      title: 'Emergency', 
      desc: '24/7 immediate help',
      bg: 'bg-red-50',
      text: 'text-red-600',
    },
    { 
      to: '/patient/video-consult', 
      icon: Video, 
      title: 'Video Consult', 
      desc: 'Online doctor visit',
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
    },
    { 
      to: '/patient/medical-records', 
      icon: Download, 
      title: 'Download Reports', 
      desc: 'Latest lab results',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    },
    { 
      to: '/patient/support', 
      icon: MessageSquare, 
      title: 'Contact Support', 
      desc: 'Get help & assistance',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-teal-600" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * (index + 1) }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={action.to}
              className="group block bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-transparent text-center"
            >
              <div className={`${action.bg} p-3.5 rounded-xl mx-auto w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className={`w-7 h-7 ${action.text}`} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-3">
                {action.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {action.desc}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Next Appointment Card
const NextAppointmentCard = ({ appointment }) => {
  if (!appointment) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700">No Upcoming Appointments</h3>
        <p className="text-sm text-slate-500 mt-1">Book your next appointment today</p>
        <Link
          to="/patient/doctors"
          className="inline-block mt-4 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-teal-600/20"
        >
          Find a Doctor
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden"
    >
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Next Appointment
        </h2>
        <StatusBadge status={appointment.status} />
      </div>
      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <img
            src={appointment.doctor?.photo || `https://ui-avatars.com/api/?name=${appointment.doctor?.fullName || 'Doctor'}&background=0D9488&color=fff`}
            alt={appointment.doctor?.fullName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-teal-100 flex-shrink-0"
          />
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-900">
              {appointment.doctor?.user?.fullName || 'Unknown'}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-teal-600">
              {appointment.doctor?.specialization || 'General Physician'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                {appointment.doctor?.experience || 'N/A'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {appointment.hospital || 'Hospital'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 text-xs">
          <div>
            <span className="text-slate-400">Date</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {new Date(appointment.date).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Time</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{appointment.timeSlot}</p>
          </div>
          <div>
            <span className="text-slate-400">Room</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{appointment.room || 'TBD'}</p>
          </div>
          <div>
            <span className="text-slate-400">Type</span>
            <p className="font-bold text-emerald-600 text-sm mt-0.5">
              {appointment.meetingType || 'In-Person'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {appointment.meetingType === 'Virtual' && (
            <button
              onClick={() => toast.success('Joining Tele-health Waiting Room...')}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors text-xs font-bold shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" /> Join Video Call
            </button>
          )}
          <button
            onClick={() => toast.info('Viewing appointment details...')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-xs font-bold"
          >
            View Details
          </button>
          <button
            onClick={() => toast.info('Rescheduling appointment...')}
            className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-colors text-xs font-bold"
          >
            Reschedule
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Recent Appointments
const RecentAppointments = ({ appointments }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden"
  >
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Clock className="w-5 h-5 text-teal-600" />
        Recent Appointments
      </h2>
      <Link
        to="/patient/appointments"
        className="text-xs text-teal-600 hover:underline font-bold flex items-center gap-1 transition-colors"
      >
        View All <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
    {appointments.length === 0 ? (
      <div className="p-8 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No appointments yet</p>
        <Link
          to="/patient/doctors"
          className="inline-block mt-3 text-teal-600 font-bold text-sm hover:underline"
        >
          Book your first appointment
        </Link>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase">
            <tr>
              <th className="px-6 py-3">Doctor</th>
              <th className="px-6 py-3 hidden sm:table-cell">Specialty</th>
              <th className="px-6 py-3 hidden md:table-cell">Date & Time</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {appointments.map((apt, index) => (
              <motion.tr
                key={apt._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-teal-50/20 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {
  apt.doctor?.user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "D"
}
                    </div>
                    <span className="font-bold text-slate-900">
                      {apt.doctor?.fullName || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell text-slate-600">
                  {apt.doctor?.specialization || 'General'}
                </td>
                <td className="px-6 py-4 hidden md:table-cell text-slate-600">
                  {new Date(apt.date).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  • {apt.timeSlot}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={apt.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toast.info(
  `Viewing details for ${apt.doctor?.user?.fullName}`
)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </motion.div>
);

// Medication Card
const MedicationCard = ({ medications }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden"
  >
    <div className="px-6 py-4 border-b border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Pill className="w-5 h-5 text-amber-500" />
        Today's Medication
      </h2>
    </div>
    {medications.length === 0 ? (
      <div className="p-8 text-center">
        <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm font-medium">No active medications</p>
        <p className="text-xs text-slate-400 mt-1">Your prescriptions will appear here</p>
      </div>
    ) : (
      <div className="p-5 space-y-4">
        {medications.slice(0, 3).map((med) => (
          <div
            key={med._id}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 hover:border-amber-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${
                med.progress === 100 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {med.progress === 100 ? 'Completed' : `${med.takenCount || 0}/${med.totalDoses || 0}`}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${med.progress || 0}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {med.times?.map((time, i) => (
                <span
                  key={i}
                  className={`text-[10px] px-2.5 py-0.5 rounded ${
                    med.taken?.includes(time)
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {time}
                </span>
              ))}
            </div>
          </div>
        ))}
        {medications.length > 3 && (
          <Link
            to="/patient/prescriptions"
            className="block text-center text-xs text-teal-600 font-bold hover:underline py-2"
          >
            View all {medications.length} medications
          </Link>
        )}
      </div>
    )}
  </motion.div>
);

// Health Metrics
const HealthMetrics = ({ metrics }) => {
  const metricItems = [
    {
      key: 'bmi',
      label: 'BMI',
      value: metrics?.bmi || '--',
      unit: 'kg/m²',
      status: metrics?.bmi ? (metrics.bmi >= 18.5 && metrics.bmi <= 24.9 ? 'Normal' : 'Check') : 'N/A',
      statusColor: metrics?.bmi ? (metrics.bmi >= 18.5 && metrics.bmi <= 24.9 ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-400',
    },
    {
      key: 'bloodPressure',
      label: 'Blood Pressure',
      value: metrics?.bloodPressure || '--',
      unit: 'mmHg',
      status: metrics?.bloodPressure ? 'Optimal' : 'N/A',
      statusColor: metrics?.bloodPressure ? 'text-emerald-600' : 'text-slate-400',
    },
    {
      key: 'heartRate',
      label: 'Heart Rate',
      value: metrics?.heartRate || '--',
      unit: 'bpm',
      status: metrics?.heartRate ? (metrics.heartRate >= 60 && metrics.heartRate <= 100 ? 'Normal' : 'Check') : 'N/A',
      statusColor: metrics?.heartRate ? (metrics.heartRate >= 60 && metrics.heartRate <= 100 ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-400',
    },
    {
      key: 'sugarLevel',
      label: 'Sugar Level',
      value: metrics?.sugarLevel || '--',
      unit: 'mg/dL',
      status: metrics?.sugarLevel ? (metrics.sugarLevel >= 70 && metrics.sugarLevel <= 100 ? 'Normal' : 'Check') : 'N/A',
      statusColor: metrics?.sugarLevel ? (metrics.sugarLevel >= 70 && metrics.sugarLevel <= 100 ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-500" />
          Health Metrics
        </h2>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {metricItems.map((item) => (
          <div key={item.key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
            <span className="text-[10px] font-bold uppercase text-slate-400">{item.label}</span>
            <p className="text-base sm:text-lg font-black text-slate-900 mt-1">{item.value}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-semibold ${item.statusColor}`}>{item.status}</span>
              <span className="text-[10px] text-slate-400">• {item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Emergency Contact
const EmergencyContact = ({ contacts }) => {
  const defaultContacts = [
    { name: 'Emergency', number: '102' },
    { name: 'Ambulance', number: '108' },
  ];

  const displayContacts = contacts?.length > 0 ? contacts : defaultContacts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">24/7 Emergency Response</h3>
            <p className="text-xs text-red-100">Ambulance & Hotline</p>
          </div>
        </div>

        {displayContacts.slice(0, 2).map((contact, index) => (
          <button
            key={index}
            onClick={() => {
              toast.error(`Calling ${contact.name}: ${contact.number}`);
            }}
            className="w-full mt-2.5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-sm"
          >
            <PhoneCall className="w-4 h-4" />
            Call {contact.name}: {contact.number}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ==================== FIND DOCTORS ====================

const FindDoctors = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    departments: 0,
    available: 0,
    avgExperience: 0,
  });

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/doctors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Doctor API Response:', response.data);

      let doctorsData = [];
      if (response.data.doctors) {
        doctorsData = response.data.doctors;
      } else if (Array.isArray(response.data)) {
        doctorsData = response.data;
      } else if (response.data.data) {
        doctorsData = response.data.data;
      }

      const activeDoctors = doctorsData.filter(
        (doc) => doc.status === 'active' || doc.status === 'approved' || !doc.status
      );

      setDoctors(activeDoctors);
      setFilteredDoctors(activeDoctors);

      const depts = [...new Set(activeDoctors.map((doc) => doc.department || doc.specialization).filter(Boolean))];
      setDepartments(depts);

      const total = activeDoctors.length;
      const available = activeDoctors.filter((doc) => doc.isAvailable !== false).length;
      const avgExp = total > 0 
        ? Math.round(activeDoctors.reduce((acc, doc) => acc + (doc.experience || 0), 0) / total)
        : 0;

      setStats({
        total,
        departments: depts.length,
        available,
        avgExperience: avgExp,
      });

    } catch (error) {
      console.error('Error fetching doctors:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 401) {
          toast.error('Please login again to view doctors');
        } else if (error.response.status === 403) {
          toast.error('You don\'t have permission to view doctors');
        } else {
          toast.error(error.response.data?.message || 'Failed to load doctors');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
      
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    let filtered = doctors;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.fullName?.toLowerCase().includes(term) ||
          doc.specialization?.toLowerCase().includes(term) ||
          doc.department?.toLowerCase().includes(term) ||
          doc.hospital?.toLowerCase().includes(term)
      );
    }

    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(
        (doc) =>
          doc.department === selectedDepartment ||
          doc.specialization === selectedDepartment
      );
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedDepartment, doctors]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDoctors();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('All');
  };

  const getInitials = (name) => {
    if (!name) return 'D';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <DoctorsSkeleton />;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-teal-50/30 pb-12">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-8 h-8 text-teal-600" />
                Find Doctors
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Find and book appointments with trusted healthcare professionals
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-medium text-slate-500">Total Doctors</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-medium text-slate-500">Departments</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.departments}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-slate-500">Available Today</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.available}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-slate-500">Avg Experience</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.avgExperience} yrs</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, specialization, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-w-[140px]"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {(searchTerm || selectedDepartment !== 'All') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium text-red-600 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-700">{filteredDoctors.length}</span> doctors
          </p>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No Doctors Found</h3>
            <p className="text-sm text-slate-500 mt-2">
              {searchTerm || selectedDepartment !== 'All'
                ? 'Try adjusting your search filters'
                : 'No doctors are currently available. Please check back later.'}
            </p>
            {(searchTerm || selectedDepartment !== 'All') && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-teal-600/20"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {doctor.profilePhoto ? (
                        <img
                          src={doctor.profilePhoto}
                          alt={doctor.fullName}
                          className="w-16 h-16 rounded-full object-cover ring-4 ring-teal-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold ring-4 ring-teal-100">
                          {getInitials(doctor.fullName)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base truncate">
                        {doctor.fullName}
                      </h3>
                      <p className="text-sm text-teal-600 font-medium truncate">
                        {doctor.specialization || doctor.department || 'General Physician'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          {doctor.experience || 0} yrs
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {doctor.rating || '4.5'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doctor.isAvailable !== false
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {doctor.isAvailable !== false ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{doctor.hospital || 'City Hospital'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{doctor.availability || 'Mon-Fri, 9AM - 6PM'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/patient/book-appointment/${doctor._id}`}
                      className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors text-xs font-bold text-center shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book Now
                    </Link>
                    <Link
                      to={`/patient/doctor-profile/${doctor._id}`}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-xs font-bold"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Doctors Skeleton
const DoctorsSkeleton = () => (
  <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-teal-50/30 py-6 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-[1920px] mx-auto space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-4 bg-slate-200 rounded w-64 mt-2"></div>
        </div>
        <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 h-24 shadow-sm"></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-4 h-16 shadow-sm"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 h-64 shadow-sm"></div>
        ))}
      </div>
    </div>
  </div>
);

export { PatientDashboard, FindDoctors };
export default PatientDashboard;