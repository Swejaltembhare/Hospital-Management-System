import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CalendarCheck,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
  CheckCircle,
  XCircle,
  Phone,
  PhoneCall,
  Sparkles,
  MessageSquare,
  CalendarPlus,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    confirmed: { color: "bg-teal-50 text-teal-700 border-teal-200", icon: CalendarCheck },
    completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    cancelled: { color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
  };
  const current = statusMap[status?.toLowerCase()] || statusMap.pending;
  const StatusIcon = current.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${current.color}`}>
      <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending"}
    </span>
  );
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    pendingReports: 0,
  });
  const [nextAppointment, setNextAppointment] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  // Fetch patient metrics, upcoming visit, and emergency contacts
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [appointmentsRes, emergencyRes] = await Promise.allSettled([
        api.get("/patients/appointments"),
        api.get("/patients/emergency-contacts"),
      ]);

      if (appointmentsRes.status === "fulfilled") {
        const appointments = appointmentsRes.value.data.appointments || [];
        const now = new Date();

        const upcoming = appointments.filter(
          (apt) => new Date(apt.date) >= now && apt.status === "confirmed"
        );
        const completed = appointments.filter((apt) => apt.status === "completed");

        setStats({
          upcomingAppointments: upcoming.length,
          completedAppointments: completed.length,
          pendingReports: appointments.filter((apt) => apt.status === "pending").length || 0,
        });

        setNextAppointment(upcoming.length > 0 ? upcoming[0] : null);
        setRecentAppointments(appointments.slice(0, 5));
      } else {
        toast.error("Could not fetch appointments schedule");
      }

      if (emergencyRes.status === "fulfilled") {
        setEmergencyContacts(emergencyRes.value.data.contacts || []);
      }
    } catch (error) {
      console.error("Dashboard parallel fetch error:", error);
      toast.error("Failed to sync dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRateDoctor = async (appointmentId, ratingValue) => {
    try {
      const response = await api.put(
        `/patients/appointments/${appointmentId}/rating`,
        { rating: Number(ratingValue) }
      );

      if (response.data.success) {
        toast.success("Thank you for rating the doctor!");
        setRecentAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId ? { ...apt, rating: ratingValue } : apt
          )
        );
      }
    } catch (error) {
      console.error("Error rating doctor:", error);
      toast.error(error.response?.data?.error || "Failed to submit rating");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleCallEmergency = (number) => {
    window.location.href = `tel:${number}`;
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Patient Welcome Banner */}
        <WelcomeSection
          user={user}
          getGreeting={getGreeting}
          upcomingCount={stats.upcomingAppointments}
        />

        {/* Patient Overview Metrics */}
        <HealthStats stats={stats} />

        {/* Patient Quick Actions */}
        <QuickActions navigate={navigate} />

        {/* Schedule & Emergency Assistance Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6">
            <NextAppointmentCard appointment={nextAppointment} navigate={navigate} />
            <RecentAppointments 
              appointments={recentAppointments} 
              onRateDoctor={handleRateDoctor}
            />
          </div>

          <div className="xl:col-span-4 space-y-6">
            <EmergencyContact contacts={emergencyContacts} onCall={handleCallEmergency} />
          </div>
        </div>

      </div>
    </div>
  );
};

// Skeleton Placeholder Component
const DashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 font-sans">
    <div className="w-full max-w-[1920px] mx-auto space-y-6 animate-pulse">
      <div className="bg-slate-200 rounded-3xl h-36"></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 h-24 shadow-sm"></div>
        ))}
      </div>
    </div>
  </div>
);

// Welcome Header Section Sub-Component
const WelcomeSection = ({ user, getGreeting }) => (
  <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {getGreeting()}, {user?.fullName?.split(" ")[0] || "Patient"}!
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
          Welcome to your health portal • {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 self-start sm:self-auto">
        <p className="text-[10px] uppercase font-bold text-emerald-200">Account Role</p>
        <p className="text-xs font-extrabold text-white capitalize">{user?.role || "Patient"}</p>
      </div>
    </div>
    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
  </div>
);

// Health Statistics Cards Sub-Component
const HealthStats = ({ stats }) => {
  const statItems = [
    { icon: CalendarCheck, label: "Upcoming Visits", value: stats.upcomingAppointments, color: "text-blue-600 bg-blue-50" },
    { icon: CheckCircle, label: "Completed Consults", value: stats.completedAppointments, color: "text-emerald-600 bg-emerald-50" },
    { icon: FileText, label: "Pending Requests", value: stats.pendingReports, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {statItems.map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
          <div className={`p-3 rounded-xl ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Quick Actions Navigation Grid Sub-Component
const QuickActions = ({ navigate }) => {
  const actions = [
    { icon: CalendarPlus, title: "Book Appointment", desc: "Schedule consultation", bg: "bg-emerald-700", path: "/patient/book-appointment", prominent: true },
    { icon: CalendarCheck, title: "My Appointments", desc: "View your schedule", bg: "bg-teal-600", path: "/patient/appointments" },
    { icon: FileText, title: "Medical Records", desc: "Prescriptions & history", bg: "bg-indigo-600", path: "/patient/medical-records" },
    { icon: MessageSquare, title: "Support Ticket", desc: "Inquiries & assistance", bg: "bg-amber-600", path: "/patient/support" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className={`group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left border cursor-pointer ${
              action.prominent ? "border-emerald-200 ring-2 ring-emerald-500/10" : "border-slate-100"
            }`}
          >
            <div className={`${action.bg} p-3 rounded-xl w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-3">{action.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// Next Scheduled Appointment Highlight Sub-Component
const NextAppointmentCard = ({ appointment, navigate }) => {
  if (!appointment) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">No Upcoming Appointments</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
            You don't have any visits scheduled. Easily find a specialist and book a convenient slot.
          </p>
        </div>
        <button
          onClick={() => navigate("/patient/book-appointment")}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
        >
          Book an Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Next Scheduled Visit
        </h2>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <img
            src={
              appointment.doctor?.photo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.doctor?.fullName || "Doctor")}&background=059669&color=fff`
            }
            alt={appointment.doctor?.fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-slate-50 flex-shrink-0"
          />
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Dr. {(appointment.doctor?.fullName || "Doctor").replace(/^Dr\.\s*/i, "")}
            </h3>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">{appointment.doctor?.specialization || "General Physician"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 text-xs border border-slate-100">
          <div>
            <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Date</span>
            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
              {new Date(appointment.date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Time</span>
            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">{appointment.timeSlot}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recent Activity & Rating Table Sub-Component
const RecentAppointments = ({ appointments, onRateDoctor }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <Clock className="w-4 h-4 text-emerald-600" />
        Recent Activity & Doctor Rating
      </h2>
      <Link to="/patient/appointments" className="text-xs text-emerald-700 font-bold flex items-center gap-1 hover:underline">
        View All <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>

    {appointments.length === 0 ? (
      <div className="p-8 text-center text-slate-400 text-xs font-medium">
        No recent appointment history found.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="px-6 py-3">Doctor</th>
              <th className="px-6 py-3 hidden sm:table-cell">Specialty</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Rate Doctor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {appointments.map((apt) => (
              <tr key={apt._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">
                  Dr. {(apt.doctor?.user?.fullName || apt.doctor?.fullName || "Doctor").replace(/^Dr\.\s*/i, "")}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell text-slate-600">{apt.doctor?.specialization || "General"}</td>
                <td className="px-6 py-4"><StatusBadge status={apt.status} /></td>
                <td className="px-6 py-4 text-center">
                  {apt.status?.toLowerCase() === "completed" ? (
                    <RatingStars
                      currentRating={apt.rating || 0}
                      onRate={(stars) => onRateDoctor(apt._id, stars)}
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400 italic font-normal">Available after visit</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// Interactive Star Rating Input Sub-Component
const RatingStars = ({ currentRating, onRate }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRate(star);
          }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              star <= (hover || currentRating)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Emergency Contacts Quick Trigger Sub-Component
const EmergencyContact = ({ contacts, onCall }) => {
  const displayContacts = contacts?.length > 0 ? contacts : [
    { name: "Hospital Emergency", number: "102" },
    { name: "Ambulance Direct", number: "108" },
  ];

  return (
    <div className="bg-gradient-to-br from-rose-600 to-red-700 rounded-3xl shadow-md p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">Emergency Assistance</h3>
            <p className="text-xs text-rose-100 font-medium">Click to call immediately</p>
          </div>
        </div>

        {displayContacts.slice(0, 2).map((contact, index) => (
          <button
            key={index}
            onClick={() => onCall(contact.number)}
            className="w-full mt-2.5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            {contact.name}: {contact.number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;