import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  UserCircle,
  Shield,
  Save,
  Eye,
  EyeOff,
  Key,
  CheckCircle,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Keep setting values aligned with the authenticated user context
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phoneNumber || user.phone || "",
      });
    }
  }, [user]);

  const tabs = [
    { id: "profile", label: "Admin Profile", icon: UserCircle },
    { id: "security", label: "Security & Password", icon: Shield },
  ];

  // Calculate real-time password strength indicators
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-rose-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Good", color: "bg-teal-500" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-emerald-600" };
      default:
        return { score: 10, label: "Too Short", color: "bg-rose-500" };
    }
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  // Submit admin personal profile updates
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!profile.name.trim()) return toast.error("Full Name is required");

    setLoading(true);
    try {
      const response = await api.put("/admin/settings", {
        fullName: profile.name,
        phoneNumber: profile.phone,
      });

      if (response.data?.success) {
        updateUser({ ...user, fullName: profile.name, phoneNumber: profile.phone });
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Submit admin security password update
  const handleUpdatePassword = async (e) => {
    e?.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword) return toast.error("Please enter current password");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const response = await api.put("/admin/settings/password", {
        currentPassword,
        newPassword,
      });

      if (response.data?.success) {
        toast.success("Password updated successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  // Render Admin Profile Form Tab Content
  const renderProfileTab = () => (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white text-3xl font-extrabold flex items-center justify-center shadow-md">
          {profile.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <h3 className="text-lg font-extrabold text-slate-900">
            {profile.name || "System Administrator"}
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            Role: <span className="text-emerald-700 font-bold capitalize">{user?.role || "Admin"}</span>
          </p>
          <div className="flex justify-center sm:justify-start pt-1">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle size={12} className="mr-1" /> Active Super Admin
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold transition text-slate-800 placeholder:text-slate-400"
              placeholder="Your Name"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Email Address (Read-only)
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-100/80 border border-slate-200 rounded-xl text-slate-500 text-sm font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold transition text-slate-800 placeholder:text-slate-400"
              placeholder="Enter Phone Number"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save size={16} /> {loading ? "Saving..." : "Save Profile Changes"}
        </motion.button>
      </div>
    </form>
  );

  // Render Security & Password Settings Form Tab Content
  const renderSecurityTab = () => (
    <form onSubmit={handleUpdatePassword} className="space-y-6">
      <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={20} className="text-emerald-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-emerald-900">Security Guidelines</p>
          <p className="text-emerald-700 mt-0.5">
            Enter your current password to authorize changes. Use at least 6 characters for the new password.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Current Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showPasswords.current ? "text" : "password"}
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full pl-11 pr-12 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold transition text-slate-800 placeholder:text-slate-400"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            New Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showPasswords.new ? "text" : "password"}
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full pl-11 pr-12 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold transition text-slate-800 placeholder:text-slate-400"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {passwordData.newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>
                  Strength: <strong className="text-slate-700">{passwordStrength.label}</strong>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Confirm New Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showPasswords.confirm ? "text" : "password"}
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full pl-11 pr-12 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold transition text-slate-800 placeholder:text-slate-400"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Key size={16} /> {loading ? "Updating..." : "Update Password"}
        </motion.button>
      </div>
    </form>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* Settings Page Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <SettingsIcon className="w-7 h-7 text-emerald-200" />
                Account Settings
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
                Manage your admin profile details and update account security credentials.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 self-start sm:self-auto">
              <p className="text-[10px] uppercase font-bold text-emerald-200">Role</p>
              <p className="text-xs font-extrabold text-white capitalize">{user?.role || "Admin"}</p>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Tabbed Navigation Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="flex overflow-x-auto border-b border-slate-100 p-2 gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === "profile" && renderProfileTab()}
                {activeTab === "security" && renderSecurityTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;