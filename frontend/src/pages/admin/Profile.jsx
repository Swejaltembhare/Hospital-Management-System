import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  UserCircle,
  Key,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();

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

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [profileChanged, setProfileChanged] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync profile form state with authenticated user context
  useEffect(() => {
    if (user) {
      setProfile({
        name: user?.fullName || user?.name || "",
        email: user?.email || "",
        phone: user?.phoneNumber || user?.phone || "",
      });
    }
  }, [user]);

  // Track personal detail changes against stored context
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => {
      const updated = { ...prev, [name]: value };
      const hasChanged =
        updated.name !== (user?.fullName || user?.name || "") ||
        updated.phone !== (user?.phoneNumber || user?.phone || "");
      setProfileChanged(hasChanged);
      return updated;
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate admin password change rules
  const validatePassword = () => {
    const errors = { currentPassword: "", newPassword: "", confirmPassword: "" };

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return !errors.currentPassword && !errors.newPassword && !errors.confirmPassword;
  };

  // Submit admin personal info updates
  const saveProfile = async (e) => {
    e?.preventDefault();
    if (!profileChanged) return toast.info("No changes to save");
    if (!profile.name.trim()) return toast.error("Name is required");

    setLoadingProfile(true);
    try {
      const res = await api.put("/admin/settings", {
        fullName: profile.name,
        phoneNumber: profile.phone,
      });

      if (res.data?.success) {
        updateUser({ ...user, fullName: profile.name, phoneNumber: profile.phone });
        setProfileChanged(false);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Submit admin security password update
  const changeAdminPassword = async (e) => {
    e?.preventDefault();
    if (!validatePassword()) return;

    setLoadingPassword(true);
    try {
      const res = await api.put("/admin/settings/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data?.success) {
        toast.success("Password updated successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to change password. Please check your current password."
      );
    } finally {
      setLoadingPassword(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-12 font-sans">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">

        {/* Admin Profile Hero Banner */}
        <div className="w-full bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold border border-white/30 shadow-md">
                {user?.fullName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                  {user?.fullName || user?.name || "Admin Profile"}
                </h1>
                <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                  {user?.email || "admin@medicare.com"}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/20 capitalize">
                    {user?.role || "Administrator"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-100 bg-emerald-800/60 px-2.5 py-0.5 rounded-full border border-emerald-600/50">
                    <CheckCircle size={12} className="text-emerald-300" /> Active System Admin
                  </span>
                </div>
              </div>
            </div>

            {user?.createdAt && (
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 self-start sm:self-auto flex items-center gap-2">
                <Calendar size={16} className="text-emerald-200" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-200">Member Since</p>
                  <p className="text-xs font-bold text-white">{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Settings Grid Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Personal Information Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-emerald-600" />
                  My Personal Details
                </h2>
                <p className="text-xs text-slate-500 mt-1">Manage your administrator profile details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                      placeholder="Enter full name"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {profileChanged ? "Unsaved changes pending" : "All changes saved"}
                </span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loadingProfile || !profileChanged}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={16} />
                  {loadingProfile ? "Saving..." : "Save Details"}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Account Security Password Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <form onSubmit={changeAdminPassword} className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  Change Admin Password
                </h2>
                <p className="text-xs text-slate-500 mt-1">Update your own account security credentials</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showCurrent ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className={`w-full pl-11 pr-12 py-2.5 sm:py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold text-slate-800 transition-all ${
                        passwordErrors.currentPassword ? "border-rose-400" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={13} /> {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showNew ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 6 characters"
                      className={`w-full pl-11 pr-12 py-2.5 sm:py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold text-slate-800 transition-all ${
                        passwordErrors.newPassword ? "border-rose-400" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={13} /> {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className={`w-full pl-11 pr-12 py-2.5 sm:py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-semibold text-slate-800 transition-all ${
                        passwordErrors.confirmPassword ? "border-rose-400" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={13} /> {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loadingPassword}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Lock size={16} />
                  {loadingPassword ? "Updating..." : "Update Password"}
                </motion.button>
              </div>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Profile;