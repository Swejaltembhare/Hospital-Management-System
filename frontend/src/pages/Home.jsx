import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../services/api";
import {
  Calendar,
  Users,
  ClipboardList,
  Clock,
  BadgeCheck,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Sparkles,
} from "lucide-react";

// Feature Card Sub-Component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  colorClass = "text-emerald-700",
}) => (
  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-emerald-300 transition-all text-left">
    <div className="w-10 h-10 bg-emerald-50/80 rounded-xl flex items-center justify-center mb-3">
      <Icon className={`w-5 h-5 ${colorClass}`} />
    </div>
    <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
      {title}
    </h3>
    <p className="text-xs text-slate-500 leading-relaxed font-medium">
      {description}
    </p>
  </div>
);

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Retrieve hospital dashboard statistics on load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        const data = response.data?.data || {};

        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Determine user role dashboard target path
  const getDashboardPath = () => {
    if (!isAuthenticated) return "/register";
    if (user?.role === "patient") return "/patient/dashboard";
    if (user?.role === "doctor") return "/doctor/dashboard";
    if (user?.role === "admin") return "/admin/dashboard";
    return "/register";
  };

  const getButtonText = () => {
    if (!isAuthenticated) return "Book Appointment";
    return "Go to Dashboard";
  };

  const getHeroTitle = () => {
    if (!isAuthenticated) return "Book Doctor Appointments Online in Seconds";
    if (user?.role === "patient") return "Welcome Back to Your Health Portal";
    if (user?.role === "doctor") return "Manage Your Practice & Patients";
    if (user?.role === "admin") return "Hospital Operations Dashboard";
    return "Book Doctor Appointments Online in Seconds";
  };

  const getHeroSubtitle = () => {
    if (!isAuthenticated) {
      return "Connect with top-rated specialists, manage schedule bookings, and access medical records with total security.";
    }
    if (user?.role === "patient") {
      return "View your upcoming appointments, access prescriptions, and consult top specialists.";
    }
    if (user?.role === "doctor") {
      return "Manage daily patient queues, confirm appointments, and review medical histories.";
    }
    if (user?.role === "admin") {
      return "Monitor hospital performance metrics, doctor availability, and overall system workflows.";
    }
    return "Connect with top-rated specialists, manage schedule bookings, and access medical records with total security.";
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/70 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-8">
        {/* Landing Page Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
            <div className="md:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-semibold text-emerald-100">
                  {isAuthenticated
                    ? `Hello, ${user?.fullName || user?.name || "User"}`
                    : "Trusted Healthcare Partner"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {getHeroTitle()}
              </h1>

              <p className="text-emerald-100/90 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                {getHeroSubtitle()}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to={getDashboardPath()}
                  className="bg-white hover:bg-emerald-50 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{getButtonText()}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </Link>

                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="bg-white/15 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Public Images Integration Showcase Card */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <div className="overflow-hidden rounded-3xl shadow-lg border-2 border-white/20 bg-emerald-900/40">
                  <img
                    src="/images/hospital1.png"
                    alt="Doctor Consultation"
                    className="w-full h-64 sm:h-72 lg:h-80 object-cover object-center"
                    onError={(e) => {
                      e.target.src = "/images/hospital.png";
                    }}
                  />
                </div>

                <div className="absolute -bottom-3 -left-3 bg-white text-slate-900 px-3.5 py-2.5 rounded-2xl text-xs font-bold shadow-md flex items-center gap-2.5 border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="text-[11px] text-slate-800 leading-tight">
                      Verified Doctors
                    </p>
                    <p className="text-[9px] text-slate-400 font-normal mt-0.5">
                      24/7 Service Available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Platform Feature Cards Grid */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
              Why Choose Us
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
              {isAuthenticated && user?.role === "patient"
                ? "Everything You Need for Healthcare"
                : "Comprehensive Hospital Management Solutions"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isAuthenticated && user?.role === "patient" ? (
              <>
                <FeatureCard
                  icon={Calendar}
                  title="Instant Booking"
                  description="Choose specialist doctors and preferred slots easily."
                />
                <FeatureCard
                  icon={Clock}
                  title="Schedule Tracking"
                  description="Monitor active, completed, or upcoming appointments."
                />
                <FeatureCard
                  icon={ClipboardList}
                  title="Digital Prescriptions"
                  description="View prescription notes and treatment plans digitally."
                />
                <FeatureCard
                  icon={BadgeCheck}
                  title="Verified Care"
                  description="Access certified doctors and medical specialists."
                />
              </>
            ) : (
              <>
                <FeatureCard
                  icon={Users}
                  title="Doctor Management"
                  description="Configure schedules, departments, and consultation rates."
                />
                <FeatureCard
                  icon={UserPlus}
                  title="Patient Services"
                  description="Streamlined patient appointment requests and history."
                />
                <FeatureCard
                  icon={Calendar}
                  title="Real-Time Slots"
                  description="Automated slot conflict detection and availability."
                />
                <FeatureCard
                  icon={BarChart3}
                  title="System Insights"
                  description="Track patient volume and hospital performance metrics."
                />
              </>
            )}
          </div>
        </div>

        {/* Bottom Call-to-Action Card */}
        <div className="bg-white rounded-3xl shadow-2xs border border-slate-200/80 p-6 text-center space-y-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mx-auto border border-emerald-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Seamless Health Management
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Get started with our healthcare platform to manage schedules,
              doctors, and patient visits efficiently.
            </p>
          </div>
          <Link
            to={getDashboardPath()}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-2xs cursor-pointer"
          >
            <span>{getButtonText()}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
