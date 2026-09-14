import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Stethoscope,
  Building2,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import Analytics from "../../components/admin/Analytics";
import QuickActions from "../../components/admin/QuickActions";
import { adminAPI } from "../../services/api";

// Sub-Component: Stat Metric Card
const StatCard = ({ label, value, icon: Icon, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.03 * index }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-300 border border-slate-200/80 flex items-center justify-between"
  >
    <div className="min-w-0 flex-1">
      <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
        {value}
      </p>
    </div>
    <div className={`bg-gradient-to-r ${color} p-2.5 sm:p-3 rounded-xl text-white ml-2 shrink-0 shadow-2xs`}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
    </div>
  </motion.div>
);

// Sub-Component: Doctor List Item
const DoctorRow = ({ doctor }) => (
  <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between border border-slate-100">
    <div className="min-w-0 pr-2">
      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
        Dr. {doctor.user?.fullName || doctor.fullName || "Unknown"}
      </p>
      <p className="text-[11px] text-slate-500 truncate mt-0.5">
        {doctor.department || "General"}
      </p>
    </div>
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
        doctor.isAvailable !== false
          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
          : "bg-rose-50 text-rose-700 border border-rose-100"
      }`}
    >
      {doctor.isAvailable !== false ? "Available" : "Unavailable"}
    </span>
  </div>
);

// Sub-Component: Patient List Item
const PatientRow = ({ patient }) => (
  <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between border border-slate-100">
    <div className="min-w-0 pr-2">
      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
        {patient.user?.fullName || patient.fullName || "N/A"}
      </p>
      <p className="text-[11px] text-slate-500 truncate mt-0.5">
        {patient.user?.email || patient.email || "N/A"}
      </p>
    </div>
    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200/60 text-slate-700 shrink-0">
      {patient.bloodGroup || "N/A"}
    </span>
  </div>
);

// Skeleton Loading Placeholder
const LoadingSkeleton = () => (
  <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
    <div className="w-full h-32 bg-slate-200 rounded-3xl animate-pulse" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={`skel-card-${i}`} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 h-72 bg-slate-200 rounded-3xl animate-pulse" />
      <div className="h-72 bg-slate-200 rounded-3xl animate-pulse" />
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [showAllPatients, setShowAllPatients] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, doctorsRes, patientsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getDoctors({ limit: 10 }),
          adminAPI.getPatients({ limit: 5 }),
        ]);

        if (isMounted) {
          setStats(statsRes.data?.data || statsRes.data || null);
          setDoctors(Array.isArray(doctorsRes.data?.data || doctorsRes.data) ? (doctorsRes.data?.data || doctorsRes.data) : []);
          setPatients(Array.isArray(patientsRes.data?.data || patientsRes.data) ? (patientsRes.data?.data || patientsRes.data) : []);
          setRecentActivities([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (isMounted) {
          toast.error("Failed to load dashboard data");
          setStats({
            totalDoctors: 0,
            totalPatients: 0,
            totalDepartments: 0,
            totalAppointments: 0,
            todayAppointments: 0,
            pendingAppointments: 0,
            completedAppointments: 0,
            cancelledAppointments: 0,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <LoadingSkeleton />;

  const statCards = [
    { label: "Total Doctors", value: stats?.totalDoctors || 0, icon: Stethoscope, color: "from-teal-600 to-emerald-600" },
    { label: "Total Patients", value: stats?.totalPatients || 0, icon: Users, color: "from-emerald-600 to-teal-600" },
    { label: "Departments", value: stats?.totalDepartments || 0, icon: Building2, color: "from-cyan-600 to-teal-600" },
    { label: "Total Appointments", value: stats?.totalAppointments || 0, icon: Calendar, color: "from-indigo-600 to-slate-700" },
    { label: "Today's Appointments", value: stats?.todayAppointments || 0, icon: Clock, color: "from-blue-600 to-indigo-600" },
    { label: "Pending", value: stats?.pendingAppointments || 0, icon: Activity, color: "from-amber-500 to-amber-600" },
    { label: "Completed", value: stats?.completedAppointments || 0, icon: CheckCircle, color: "from-emerald-600 to-emerald-700" },
    { label: "Cancelled", value: stats?.cancelledAppointments || 0, icon: XCircle, color: "from-rose-500 to-rose-600" },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Welcome Banner Container */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <LayoutDashboard className="w-7 h-7 text-emerald-200" />
                Welcome back, {user?.fullName || "Admin"}!
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
                MediCare Hospital System • {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Primary Statistics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
        >
          {statCards.map((stat, index) => (
            <StatCard
              key={`stat-${stat.label.replace(/\s+/g, '-').toLowerCase()}`}
              {...stat}
              index={index}
            />
          ))}
        </motion.div>

        {/* Main Content Layout: Analytics & Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch"
        >
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <Analytics />
          </div>
          <div className="lg:col-span-1 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <QuickActions />
          </div>
        </motion.div>

        {/* Data Activity Lists */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch"
        >
          {/* Recent Activity Card */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-700" />
                Recent Activity
              </h3>
              {recentActivities.length > 0 && (
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-100">
                  {recentActivities.length}
                </span>
              )}
            </div>
            <div className="p-4 flex-1 h-[320px] overflow-y-auto">
              {recentActivities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id || `act-${index}`} className="py-2.5 flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 truncate font-semibold">{activity.message}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-slate-400">
                  <div>
                    <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">No recent activity</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Management Summary Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            
            {/* Doctors Summary List */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-700" />
                  Doctors ({doctors.length})
                </h3>
                <button
                  onClick={() => setShowAllDoctors(!showAllDoctors)}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  {showAllDoctors ? "Less" : "All"}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllDoctors ? "rotate-90" : ""}`} />
                </button>
              </div>
              <div className="p-3 sm:p-4 flex-1 h-[320px] overflow-y-auto space-y-2">
                {doctors && doctors.length > 0 ? (
                  (showAllDoctors ? doctors : doctors.slice(0, 4)).map((doctor, index) => (
                    <DoctorRow key={doctor._id || `doc-${index}`} doctor={doctor} />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-500">No doctors registered</p>
                  </div>
                )}
              </div>
            </div>

            {/* Patients Summary List */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  Patients ({patients.length})
                </h3>
                <button
                  onClick={() => setShowAllPatients(!showAllPatients)}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  {showAllPatients ? "Less" : "All"}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllPatients ? "rotate-90" : ""}`} />
                </button>
              </div>
              <div className="p-3 sm:p-4 flex-1 h-[320px] overflow-y-auto space-y-2">
                {patients && patients.length > 0 ? (
                  patients.slice(0, 5).map((patient, index) => (
                    <PatientRow key={patient._id || `pat-${index}`} patient={patient} />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-500">No patients registered</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;