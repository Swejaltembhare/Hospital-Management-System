// src/components/admin/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Pill,
  FlaskRound,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Stethoscope,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  CreditCard,
  Package,
  Microscope,
  Activity,
  UserCircle,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Sub-menu component for nested items
const SubMenu = ({ item, open }) => {
  const [subOpen, setSubOpen] = useState(false);

  if (!item.subItems) {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
            isActive
              ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 shadow-sm"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`
        }
      >
        <item.icon size={20} className="flex-shrink-0" />
        <span className="text-sm font-medium whitespace-nowrap">
          {item.label}
        </span>
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => open && setSubOpen(!subOpen)}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      >
        <item.icon size={20} className="flex-shrink-0" />
        <span className="text-sm font-medium flex-1 text-left">
          {item.label}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${subOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {subOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 mt-1 space-y-1 overflow-hidden"
          >
            {item.subItems.map((subItem) => (
              <NavLink
                key={subItem.path}
                to={subItem.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50/50 text-blue-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`
                }
              >
                <subItem.icon size={16} className="flex-shrink-0" />
                <span className="text-sm">{subItem.label}</span>
                {subItem.badge && (
                  <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                    {subItem.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ open, setOpen, mobile = false, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: Stethoscope,
      label: "Doctor Management",
      subItems: [
        {
          icon: Users,
          label: "All Doctors",
          path: "/admin/doctors",
        },
      ],
    },
    {
      icon: Users,
      label: "Patient Management",
      subItems: [
        { icon: Users, label: "All Patients", path: "/admin/patients" },
      ],
    },
    {
      icon: Calendar,
      label: "Appointment Management",
      subItems: [
        {
          icon: Calendar,
          label: "All Appointments",
          path: "/admin/appointments",
        },
      ],
    },
    {
      icon: DollarSign,
      label: "Billing",
      subItems: [
        { icon: FileText, label: "Invoices", path: "/admin/billing/invoices" },
        {
          icon: CreditCard,
          label: "Payments",
          path: "/admin/billing/payments",
        },
      ],
    },
    {
      icon: Pill,
      label: "Pharmacy",
      subItems: [
        {
          icon: Package,
          label: "Medicines",
          path: "/admin/pharmacy/medicines",
        },
        {
          icon: Package,
          label: "Inventory",
          path: "/admin/pharmacy/inventory",
        },
      ],
    },
    {
      icon: FlaskRound,
      label: "Laboratory",
      subItems: [
        {
          icon: FileText,
          label: "Lab Reports",
          path: "/admin/laboratory/reports",
        },
        {
          icon: Microscope,
          label: "Test Requests",
          path: "/admin/laboratory/requests",
        },
      ],
    },
    {
      icon: BarChart3,
      label: "Analytics",
      subItems: [
        {
          icon: BarChart3,
          label: "Dashboard Analytics",
          path: "/admin/analytics",
        },
        {
          icon: DollarSign,
          label: "Revenue",
          path: "/admin/analytics/revenue",
        },
        {
          icon: Users,
          label: "Patient Statistics",
          path: "/admin/analytics/patients",
        },
      ],
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/admin/notifications",
      badge: "3",
    },
    {
      icon: Settings,
      label: "Settings",
      subItems: [
        {
          icon: Settings,
          label: "Hospital Settings",
          path: "/admin/settings/hospital",
        },
        {
          icon: UserCircle,
          label: "Admin Profile",
          path: "/admin/settings/profile",
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay for mobile/desktop when sidebar is open */}
      {!mobile && open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {mobile && open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={{ x: -288 }}
        animate={{ x: open ? 0 : -288 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-72 h-screen bg-white border-r border-gray-200 z-50 shadow-xl"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section with Close Button */}
          <div className="flex items-center justify-between h-20 px-4 border-b border-gray-100/80">
            <div className="flex items-center gap-3 overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 flex-shrink-0"
              >
                <span className="tracking-tight">H</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg leading-tight tracking-tight">
                  MediCare
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
                  Hospital Management
                </span>
              </div>
            </div>
            {/* Close button always visible */}
            <button
              onClick={() => {
                if (mobile && onClose) onClose();
                else setOpen(false);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={22} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-3 py-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Admin Profile Section */}
          <div className="px-3 pb-3 border-b border-gray-100/80">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-blue-50/50 to-blue-100/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex-shrink-0">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || "Super Admin"}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <SubMenu key={index} item={item} open={true} />
              ))}
            </div>
          </nav>

          {/* Logout Section */}
          <div className="border-t border-gray-100/80 p-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 group"
            >
              <LogOut
                size={20}
                className="flex-shrink-0 group-hover:rotate-12 transition-transform"
              />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
