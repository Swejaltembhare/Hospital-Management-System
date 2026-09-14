import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  HeartPulse,
  X,
} from "lucide-react";
import { adminAPI } from "../../services/api";

const Navbar = ({
  sidebarOpen,
  setSidebarOpen,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch admin notifications from backend API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNotifications();
      const data = response.data || response;
      setNotifications(data.notifications || data || []);
      setUnreadCount(
        data.unreadCount ||
          (data.notifications || []).filter((n) => !n.read).length ||
          0
      );
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Setup notification polling interval and click outside listener
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark single notification as read and decrement count
  const markAsRead = async (notificationId) => {
    try {
      await adminAPI.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await adminAPI.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to mark all as read");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 right-0 left-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs font-sans"
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Sidebar Controls & Standardized MediCare Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileSidebarOpen(!mobileSidebarOpen);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition lg:hidden cursor-pointer"
          >
            <Menu size={22} />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <Menu size={22} />
          </button>

          <Link to="/admin/dashboard" className="hidden sm:flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-emerald-600 blur-xs opacity-30 group-hover:opacity-60 transition" />
              <div className="relative w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center shadow-sm">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                MediCare
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">
                Hospital Management System
              </p>
            </div>
          </Link>
        </div>

        {/* Global Search Input */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-md mx-4 hidden md:block"
        >
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search doctors, patients, appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-xs font-medium"
            />
          </div>
        </form>

        {/* Notifications and Profile Dropdown Action Controls */}
        <div className="flex items-center gap-2">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse shadow-2xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 font-sans"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Notifications ({unreadCount})
                    </h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 hover:bg-slate-200/60 rounded-lg transition text-slate-400 cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
                    {loading ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <p className="text-xs font-semibold">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                            notification.read
                              ? "bg-white hover:bg-slate-50 opacity-70"
                              : "bg-emerald-50/30 hover:bg-emerald-50/70"
                          }`}
                        >
                          <div className="mt-1">
                            <span
                              className={`w-2 h-2 rounded-full block ${
                                notification.read
                                  ? "bg-slate-300"
                                  : "bg-emerald-600 animate-pulse"
                              }`}
                            ></span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-xs ${
                                  notification.read
                                    ? "text-slate-600 font-medium"
                                    : "font-bold text-slate-900"
                                } truncate`}
                              >
                                {notification.title}
                              </p>
                              <span className="text-[9px] text-slate-400 font-medium flex-shrink-0">
                                {new Date(notification.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {notification.message && (
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                                {notification.message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="w-8 h-8 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <span className="hidden lg:block text-xs font-bold text-slate-800">
                {user?.fullName || "Admin"}
              </span>
              <ChevronDown size={14} className="hidden lg:block text-slate-400" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-50 font-sans space-y-1"
                >
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/80">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.fullName || "Admin User"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {user?.email || "admin@hospital.com"}
                    </p>
                  </div>

                  <Link
                    to="/admin/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    <User size={15} className="text-emerald-700" /> Profile
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    <Settings size={15} className="text-emerald-700" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;