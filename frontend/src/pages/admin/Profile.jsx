// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import {
//   User,
//   Mail,
//   Phone,
//   Shield,
//   Calendar,
//   Camera,
//   Save,
//   Lock,
//   Eye,
//   EyeOff,
// } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
// import api from "../../services/api";
// import toast from "react-hot-toast";

// const Profile = () => {
//   const { user, updateUser } = useAuth();

//   const [profile, setProfile] = useState({
//     name: user?.fullName || "",
//     email: user?.email || "",
//     phone: user?.phoneNumber || "",
//   });

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [showCurrent, setShowCurrent] = useState(false);
//   const [showNew, setShowNew] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleProfileChange = (e) => {
//     setProfile({
//       ...profile,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handlePasswordChange = (e) => {
//     setPasswordData({
//       ...passwordData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const saveProfile = async () => {
//     try {
//       setLoading(true);

//       const res = await api.put("/auth/profile", profile);

//       updateUser(res.data.data);

//       toast.success("Profile updated successfully");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const changePassword = async () => {
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       return toast.error("Passwords do not match");
//     }

//     try {
//       setLoading(true);

//       await api.put("/auth/change-password", {
//         currentPassword: passwordData.currentPassword,
//         newPassword: passwordData.newPassword,
//       });

//       toast.success("Password Changed Successfully");

//       setPasswordData({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Password update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-8">

//       <div className="max-w-5xl mx-auto">

//         {/* Header */}

//         <motion.div
//           initial={{opacity:0,y:-20}}
//           animate={{opacity:1,y:0}}
//           className="bg-white rounded-3xl shadow-xl p-8 mb-8"
//         >

//           <div className="flex items-center gap-6">

//             <div className="relative">

//               <div className="w-32 h-32 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">

//                 <User size={60} className="text-white"/>

//               </div>

//               <button className="absolute bottom-2 right-2 bg-white shadow-lg p-2 rounded-full">

//                 <Camera size={18}/>

//               </button>

//             </div>

//             <div>

//               <h1 className="text-4xl font-bold">
//                 {user?.fullName}
//               </h1>

//               <p className="text-gray-500 mt-2">
//                 {user?.email}
//               </p>

//               <span className="mt-3 inline-block px-4 py-1 rounded-full bg-teal-100 text-teal-700 font-semibold">
//                 Administrator
//               </span>

//             </div>

//           </div>

//         </motion.div>

//         {/* Personal Information */}

//         <motion.div
//           initial={{opacity:0,y:20}}
//           animate={{opacity:1,y:0}}
//           className="bg-white rounded-3xl shadow-xl p-8 mb-8"
//         >

//           <h2 className="text-2xl font-bold mb-6">
//             Personal Information
//           </h2>

//           <div className="grid md:grid-cols-2 gap-6">

//             <div>

//               <label className="font-semibold mb-2 block">
//                 Full Name
//               </label>

//               <div className="relative">

//                 <User className="absolute left-4 top-4 text-gray-400"/>

//                 <input
//                   type="text"
//                   name="name"
//                   value={profile.name}
//                   onChange={handleProfileChange}
//                   className="w-full pl-12 p-3 border rounded-xl"
//                 />

//               </div>

//             </div>

//             <div>

//               <label className="font-semibold mb-2 block">
//                 Email
//               </label>

//               <div className="relative">

//                 <Mail className="absolute left-4 top-4 text-gray-400"/>

//                 <input
//                   type="email"
//                   name="email"
//                   value={profile.email}
//                   onChange={handleProfileChange}
//                   className="w-full pl-12 p-3 border rounded-xl"
//                 />

//               </div>

//             </div>

//             <div>

//               <label className="font-semibold mb-2 block">
//                 Phone Number
//               </label>

//               <div className="relative">

//                 <Phone className="absolute left-4 top-4 text-gray-400"/>

//                 <input
//                   type="text"
//                   name="phone"
//                   value={profile.phone}
//                   onChange={handleProfileChange}
//                   className="w-full pl-12 p-3 border rounded-xl"
//                 />

//               </div>

//             </div>

//           </div>

//           <button
//             onClick={saveProfile}
//             disabled={loading}
//             className="mt-8 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-3 rounded-xl flex items-center gap-2"
//           >

//             <Save size={18}/>

//             Save Changes

//           </button>

//         </motion.div>

//         {/* Change Password */}

//         <motion.div
//           initial={{opacity:0,y:20}}
//           animate={{opacity:1,y:0}}
//           className="bg-white rounded-3xl shadow-xl p-8 mb-8"
//         >

//           <h2 className="text-2xl font-bold mb-6">
//             Change Password
//           </h2>

//           <div className="space-y-5">

//             <div className="relative">

//               <Lock className="absolute left-4 top-4 text-gray-400"/>

//               <input
//                 type={showCurrent ? "text":"password"}
//                 placeholder="Current Password"
//                 name="currentPassword"
//                 value={passwordData.currentPassword}
//                 onChange={handlePasswordChange}
//                 className="w-full pl-12 pr-12 p-3 border rounded-xl"
//               />

//               <button
//                 className="absolute right-4 top-4"
//                 onClick={()=>setShowCurrent(!showCurrent)}
//               >
//                 {showCurrent ? <EyeOff/>:<Eye/>}
//               </button>

//             </div>

//             <div className="relative">

//               <Lock className="absolute left-4 top-4 text-gray-400"/>

//               <input
//                 type={showNew ? "text":"password"}
//                 placeholder="New Password"
//                 name="newPassword"
//                 value={passwordData.newPassword}
//                 onChange={handlePasswordChange}
//                 className="w-full pl-12 pr-12 p-3 border rounded-xl"
//               />

//               <button
//                 className="absolute right-4 top-4"
//                 onClick={()=>setShowNew(!showNew)}
//               >
//                 {showNew ? <EyeOff/>:<Eye/>}
//               </button>

//             </div>

//             <input
//               type="password"
//               placeholder="Confirm Password"
//               name="confirmPassword"
//               value={passwordData.confirmPassword}
//               onChange={handlePasswordChange}
//               className="w-full p-3 border rounded-xl"
//             />

//             <button
//               onClick={changePassword}
//               disabled={loading}
//               className="bg-red-600 text-white px-8 py-3 rounded-xl"
//             >
//               Change Password
//             </button>

//           </div>

//         </motion.div>

//         {/* Account Information */}

//         <motion.div
//           initial={{opacity:0}}
//           animate={{opacity:1}}
//           className="bg-white rounded-3xl shadow-xl p-8"
//         >

//           <h2 className="text-2xl font-bold mb-6">
//             Account Information
//           </h2>

//           <div className="grid md:grid-cols-2 gap-6">

//             <div className="flex items-center gap-3">

//               <Shield className="text-teal-600"/>

//               <div>

//                 <p className="text-gray-500">
//                   Role
//                 </p>

//                 <p className="font-bold">
//                   Administrator
//                 </p>

//               </div>

//             </div>

//             <div className="flex items-center gap-3">

//               <Calendar className="text-teal-600"/>

//               <div>

//                 <p className="text-gray-500">
//                   Joined
//                 </p>

//                 <p className="font-bold">
//                   {new Date(user?.createdAt).toLocaleDateString()}
//                 </p>

//               </div>

//             </div>

//           </div>

//         </motion.div>

//       </div>

//     </div>
//   );
// };

// export default Profile;








// src/pages/admin/Profile.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();

  // ── Profile State (matching real backend field names) ──
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // ── Password State ──
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ── UI State ──
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileChanged, setProfileChanged] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ── Check if profile changed ──
  useEffect(() => {
    const hasChanged =
      profile.name !== (user?.name || "") ||
      profile.email !== (user?.email || "") ||
      profile.phone !== (user?.phone || "");
    setProfileChanged(hasChanged);
  }, [profile, user]);

  // ── Profile Change Handler ──
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ── Password Change Handler ──
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    setPasswordErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ── Validate Password ──
  const validatePassword = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

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

  // ── Save Profile ──
  const saveProfile = async () => {
    if (!profileChanged) {
      toast.info("No changes to save");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/auth/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });

      if (res.data.success) {
        updateUser(res.data.data);
        setProfileChanged(false);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // ── Change Password ──
  const changePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data.success) {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordErrors({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // ── Get Role Badge ──
  const getRoleBadge = (role) => {
    const badges = {
      admin: "bg-purple-100 text-purple-700",
      doctor: "bg-blue-100 text-blue-700",
      patient: "bg-emerald-100 text-emerald-700",
    };
    return badges[role?.toLowerCase()] || "bg-teal-100 text-teal-700";
  };

  // ── Get Role Label ──
  const getRoleLabel = (role) => {
    const labels = {
      admin: "Administrator",
      doctor: "Doctor",
      patient: "Patient",
    };
    return labels[role?.toLowerCase()] || role || "User";
  };

  // ── Format Date ──
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4 md:p-8">
      {/* Full width container - no max-width constraint */}
      <div className="w-full space-y-6">

        {/* ── Header Card ── Full Width ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 md:p-8 border border-white/20"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg shadow-teal-500/20">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 truncate">
                {user?.name || "User"}
              </h1>
              <p className="text-gray-500 mt-1 truncate">
                {user?.email || "No email"}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span
                  className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getRoleBadge(
                    user?.role
                  )}`}
                >
                  {getRoleLabel(user?.role)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <CheckCircle size={14} />
                  Active
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── 2-Column Grid for Personal Info & Password ── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ── Personal Information ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 md:p-8 border border-white/20"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
              Personal Information
            </h2>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email - Disabled */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-500"
                    placeholder="Email cannot be changed"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    Read-only
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Save Profile Button */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={saveProfile}
                disabled={loading || !profileChanged}
                className={`px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all duration-200 ${
                  loading || !profileChanged
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-xl hover:shadow-teal-600/30 hover:scale-[1.02]"
                }`}
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
              {!profileChanged && (
                <span className="text-sm text-gray-400 self-center">
                  No changes to save
                </span>
              )}
            </div>
          </motion.div>

          {/* ── Change Password ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 md:p-8 border border-white/20"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Lock size={22} className="text-teal-600" />
              Change Password
            </h2>

            <div className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter current password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                      passwordErrors.currentPassword
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password (min 6 characters)"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                      passwordErrors.newPassword
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                      passwordErrors.confirmPassword
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Change Password Button - Teal/Emerald gradient */}
              <button
                onClick={changePassword}
                disabled={loading}
                className={`w-full mt-4 px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all duration-200 ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-xl hover:shadow-teal-600/30 hover:scale-[1.02]"
                }`}
              >
                <Lock size={18} />
                {loading ? "Updating..." : "Change Password"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── Account Information ── Full Width ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 md:p-8 border border-white/20"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Role */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Shield className="text-teal-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold text-gray-800">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </div>

            {/* Joined Date - Only if available */}
            {user?.createdAt && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="text-teal-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {/* User ID */}
            {user?.id && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Shield className="text-teal-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-mono text-sm text-gray-600 truncate">
                    {user?.id}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;