import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  Download,
  Stethoscope,
  Clock,
  RefreshCw,
  ChevronRight,
  Activity,
} from "lucide-react";
import { adminAPI } from "../../services/api";

const QuickActions = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    newPatients: 0,
  });

  // Query high-level dashboard metrics on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch pending appointment and patient counts for quick badges
  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      const data = response.data || response.stats || response || {};

      setStats({
        pendingAppointments: data.pendingAppointments || 0,
        newPatients: data.totalPatients || 0,
      });
    } catch (error) {
      console.error("Error fetching quick action stats:", error);
    }
  };

  // Trigger system CSV data export file download
  const handleExport = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/admin/export", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hospital-export-${new Date().toISOString().split("T")[0]}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      title: "Manage Patients",
      icon: Users,
      iconBg: "bg-cyan-500",
      hoverBg: "hover:bg-cyan-50/80",
      link: "/admin/patients",
      badge: stats.newPatients > 0 ? stats.newPatients : null,
    },
    {
      title: "Manage Doctors",
      icon: Stethoscope,
      iconBg: "bg-blue-500",
      hoverBg: "hover:bg-blue-50/80",
      link: "/admin/doctors",
    },
    {
      title: "Appointments",
      icon: Clock,
      iconBg: "bg-amber-500",
      hoverBg: "hover:bg-amber-50/80",
      link: "/admin/appointments",
      badge: stats.pendingAppointments > 0 ? stats.pendingAppointments : null,
    },
    {
      title: "Export Data",
      icon: Download,
      iconBg: "bg-rose-500",
      hoverBg: "hover:bg-rose-50/80",
      onClick: handleExport,
      loading: loading,
    },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Quick Actions Shortcuts Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <Activity size={16} className="text-teal-600" />
            Quick Actions
          </h3>

          <button
            onClick={fetchStats}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            title="Refresh Stats"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Action Buttons List */}
        <div className="space-y-2">
          {actions.map((action, index) => {
            const ActionIcon = action.icon;

            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="w-full"
              >
                {action.link ? (
                  <Link to={action.link} className="block w-full">
                    <div
                      className={`
                        w-full flex items-center justify-between p-2.5
                        bg-slate-50/90 ${action.hoverBg} border border-slate-100/80
                        rounded-xl transition-all group
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`
                            p-1.5 ${action.iconBg} text-white rounded-lg
                            group-hover:scale-105 transition-transform shadow-sm
                          `}
                        >
                          <ActionIcon size={14} />
                        </div>

                        <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                          {action.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {action.badge && (
                          <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                            {action.badge > 9 ? "9+" : action.badge}
                          </span>
                        )}

                        <ChevronRight
                          size={13}
                          className="text-slate-400 group-hover:text-slate-700 transition-colors"
                        />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={action.onClick}
                    disabled={action.loading}
                    className={`
                      w-full flex items-center justify-between p-2.5
                      bg-slate-50/90 ${action.hoverBg} border border-slate-100/80
                      rounded-xl transition-all group disabled:opacity-50
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 ${action.iconBg} text-white rounded-lg shadow-sm`}>
                        {action.loading ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                        ) : (
                          <ActionIcon size={14} />
                        )}
                      </div>

                      <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                        {action.loading ? "Exporting..." : action.title}
                      </span>
                    </div>

                    <ChevronRight
                      size={13}
                      className="text-slate-400 group-hover:text-slate-700 transition-colors"
                    />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hospital Showcase Imagery Container */}
        <div className="w-full overflow-hidden rounded-xl shadow-xs">
          <img
            src="/images/hospital.png"
            alt="Modern hospital facility"
            className="w-full h-[220px] object-cover rounded-xl hover:scale-102 transition-transform duration-300"
          />
        </div>

        <div className="w-full overflow-hidden rounded-xl shadow-xs">
          <img
            src="/images/hospital.png"
            alt="Doctor consulting patient"
            className="w-full h-[220px] object-cover rounded-xl hover:scale-102 transition-transform duration-300"
          />
        </div>

        <div className="w-full overflow-hidden rounded-xl shadow-xs">
          <img
            src="/images/hospital2.png"
            alt="Medical equipment"
            className="w-full h-[220px] object-cover rounded-xl hover:scale-102 transition-transform duration-300"
          />
        </div>
    </div>
  );
};

export default QuickActions;