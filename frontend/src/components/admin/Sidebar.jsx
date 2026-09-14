import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Stethoscope,
  ChevronDown,
  X,
  Receipt,
  Activity,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Sub-menu item component handling nested route links
const SubMenu = ({ item, open, onItemClick }) => {
  const [subOpen, setSubOpen] = useState(false);

  if (!item.subItems) {
    return (
      <NavLink
        to={item.path}
        onClick={onItemClick}
        className={({ isActive }) =>
          `group relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
            isActive
              ? "bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent text-teal-700 shadow-sm border-l-4 border-teal-500 font-semibold"
              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
          }`
        }
      >
        <item.icon
          size={19}
          className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110 text-teal-600"
        />
        <span className="truncate">{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => open && setSubOpen(!subOpen)}
        className="flex items-center gap-3.5 w-full px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
      >
        <item.icon size={19} className="flex-shrink-0 text-teal-600" />
        <span className="flex-1 text-left truncate">{item.label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${
            subOpen ? "rotate-180 text-teal-600" : "text-slate-400"
          }`}
        />
      </button>

      <AnimatePresence>
        {subOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="ml-7 mt-1 space-y-1 pl-3 border-l border-slate-200/80 overflow-hidden"
          >
            {item.subItems.map((subItem) => (
              <NavLink
                key={subItem.path}
                to={subItem.path}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"
                  }`
                }
              >
                <subItem.icon size={15} className="flex-shrink-0" />
                <span className="truncate">{subItem.label}</span>
                {subItem.badge && (
                  <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-xs">
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
  const [searchQuery] = useState("");

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: Stethoscope,
      label: "Doctor Management",
      path: "/admin/doctors",
    },
    {
      icon: Users,
      label: "Patient Management",
      path: "/admin/patients",
    },
    {
      icon: Calendar,
      label: "Appointment Management",
      path: "/admin/appointments",
    },
    {
      icon: Receipt,
      label: "Billing",
      path: "/admin/billing",
    },
    {
      icon: MessageSquare,
      label: "Support Tickets",
      path: "/admin/support",
    },
    {
      icon: Activity,
      label: "Audit Logs",
      path: "/admin/audit-logs",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/admin/settings",
    },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
    if (onClose) onClose();
  };

  const handleNavClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar Backdrop Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
            onClick={() => (mobile && onClose ? onClose() : setOpen(false))}
          />
        )}
      </AnimatePresence>

      {/* Slide-out Navigation Aside Panel */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-72 h-screen bg-white/95 backdrop-blur-md border-r border-slate-200/80 z-50 shadow-2xl flex flex-col justify-between select-none"
      >
        <div className="flex flex-col h-full overflow-hidden pt-4">
          {/* User Account Summary Card */}
          <div className="px-4 pb-2">
            <div className="relative p-3 rounded-2xl bg-gradient-to-r from-teal-50/80 via-emerald-50/40 to-teal-50/80 border border-teal-100/80 flex items-center gap-3">
              <button
                onClick={() => {
                  if (mobile && onClose) onClose();
                  else setOpen(false);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/70 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-teal-500/20">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.fullName || user?.name || "Admin User"}
                </p>

                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={12} className="text-teal-600" />
                  <p className="text-[11px] font-medium text-slate-500 capitalize truncate">
                    {user?.role || "Super Admin"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links Scrollable List */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <SubMenu
                  key={index}
                  item={item}
                  open={true}
                  onItemClick={handleNavClick}
                />
              ))
            ) : (
              <p className="text-xs text-center text-slate-400 py-6">
                No matching menus
              </p>
            )}
          </nav>

          {/* Footer Sign Out Button */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100/80 font-semibold text-xs transition-colors shadow-xs"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;