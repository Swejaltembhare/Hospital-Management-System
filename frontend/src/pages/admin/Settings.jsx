// // src/pages/admin/Settings.jsx
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Settings as SettingsIcon,
//   UserCircle,
//   Shield,
//   Calendar,
//   Sun,
//   Moon,
//   Save,
//   Edit,
//   Eye,
//   EyeOff,
//   Key,
//   CheckCircle,
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// const Settings = () => {
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('profile');
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   // Admin Profile State
//   const [profile, setProfile] = useState({
//     fullName: 'Dr. Admin User',
//     email: 'admin@medicare.com',
//     phone: '+1 234 567 890',
//   });

//   // Password State
//   const [passwordData, setPasswordData] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//   });

//   // Theme State
//   const [theme, setTheme] = useState('light');

//   // Appointment Settings State
//   const [appointmentSettings, setAppointmentSettings] = useState({
//     consultationDuration: 30,
//     autoApprove: true,
//   });

//   const tabs = [
//     { id: 'profile', label: 'Admin Profile', icon: UserCircle },
//     { id: 'security', label: 'Security', icon: Shield },
//     { id: 'theme', label: 'Theme Settings', icon: Sun },
//     { id: 'appointment', label: 'Appointments', icon: Calendar },
//   ];

//   const handleProfileChange = (field, value) => {
//     setProfile(prev => ({ ...prev, [field]: value }));
//   };

//   const handlePasswordChange = (field, value) => {
//     setPasswordData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleAppointmentChange = (field, value) => {
//     setAppointmentSettings(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSaveProfile = async () => {
//     setLoading(true);
//     try {
//       // API call to update profile
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       toast.success('Profile updated successfully!');
//     } catch (error) {
//       toast.error('Failed to update profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdatePassword = async () => {
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       toast.error('New password and confirm password do not match');
//       return;
//     }
//     if (passwordData.newPassword.length < 6) {
//       toast.error('Password must be at least 6 characters long');
//       return;
//     }
//     setLoading(true);
//     try {
//       // API call to update password
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       toast.success('Password updated successfully!');
//       setPasswordData({
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: '',
//       });
//     } catch (error) {
//       toast.error('Failed to update password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveAppointmentSettings = async () => {
//     setLoading(true);
//     try {
//       // API call to update appointment settings
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       toast.success('Appointment settings updated successfully!');
//     } catch (error) {
//       toast.error('Failed to update appointment settings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleTheme = () => {
//     setTheme(prev => prev === 'light' ? 'dark' : 'light');
//     toast.success(`Theme switched to ${theme === 'light' ? 'dark' : 'light'} mode`);
//   };

//   // ===================== RENDER FUNCTIONS =====================

//   const renderAdminProfile = () => (
//     <div className="space-y-6">
//       <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
//         <div className="relative">
//           <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-500/20">
//             {profile.fullName.charAt(0)}
//           </div>
//         </div>
//         <div className="flex-1">
//           <h3 className="text-xl font-bold text-slate-900">{profile.fullName}</h3>
//           <p className="text-sm text-slate-500">Super Admin</p>
//           <div className="flex flex-wrap gap-2 mt-2">
//             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
//               <CheckCircle size={12} className="mr-1" /> Active
//             </span>
//           </div>
//         </div>
//         <button
//           onClick={handleSaveProfile}
//           className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-teal-600/20"
//         >
//           <Edit size={14} /> Edit Profile
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
//           <input
//             type="text"
//             value={profile.fullName}
//             onChange={(e) => handleProfileChange('fullName', e.target.value)}
//             className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
//           <input
//             type="email"
//             value={profile.email}
//             onChange={(e) => handleProfileChange('email', e.target.value)}
//             className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
//           <input
//             type="tel"
//             value={profile.phone}
//             onChange={(e) => handleProfileChange('phone', e.target.value)}
//             className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
//           />
//         </div>
//       </div>

//       <div className="flex gap-3 pt-4 border-t border-slate-100">
//         <button
//           onClick={handleSaveProfile}
//           disabled={loading}
//           className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
//         >
//           <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
//         </button>
//       </div>
//     </div>
//   );

//   const renderSecurity = () => (
//     <div className="space-y-6">
//       <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
//         <div className="flex items-start gap-3">
//           <Shield size={20} className="text-teal-600 mt-0.5" />
//           <div>
//             <p className="text-sm font-medium text-teal-800">Security Tips</p>
//             <p className="text-sm text-teal-700 mt-1">
//               Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
//           <div className="relative">
//             <input
//               type={showCurrentPassword ? 'text' : 'password'}
//               value={passwordData.currentPassword}
//               onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
//               placeholder="Enter current password"
//               className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
//             />
//             <button
//               type="button"
//               onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//             >
//               {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
//           <div className="relative">
//             <input
//               type={showNewPassword ? 'text' : 'password'}
//               value={passwordData.newPassword}
//               onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
//               placeholder="Enter new password"
//               className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
//             />
//             <button
//               type="button"
//               onClick={() => setShowNewPassword(!showNewPassword)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//             >
//               {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
//           <div className="relative">
//             <input
//               type={showConfirmPassword ? 'text' : 'password'}
//               value={passwordData.confirmPassword}
//               onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
//               placeholder="Confirm new password"
//               className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
//             />
//             <button
//               type="button"
//               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//             >
//               {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-3 pt-4 border-t border-slate-100">
//         <button
//           onClick={handleUpdatePassword}
//           disabled={loading}
//           className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
//         >
//           <Key size={16} /> {loading ? 'Updating...' : 'Update Password'}
//         </button>
//       </div>
//     </div>
//   );

//   const renderThemeSettings = () => (
//     <div className="space-y-6">
//       <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold text-slate-900">Theme Preference</h3>
//             <p className="text-sm text-slate-500 mt-1">Choose between light and dark mode</p>
//           </div>
//           <button
//             onClick={toggleTheme}
//             className={`relative w-16 h-10 rounded-full transition-colors duration-300 flex-shrink-0 ${
//               theme === 'dark' ? 'bg-slate-800' : 'bg-teal-600'
//             }`}
//           >
//             <div
//               className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
//                 theme === 'dark' ? 'right-1' : 'left-1'
//               }`}
//             >
//               {theme === 'dark' ? (
//                 <Moon size={16} className="text-slate-700" />
//               ) : (
//                 <Sun size={16} className="text-teal-600" />
//               )}
//             </div>
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div
//           onClick={() => setTheme('light')}
//           className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
//             theme === 'light'
//               ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-500/10'
//               : 'border-slate-200 hover:border-teal-300'
//           }`}
//         >
//           <Sun size={32} className="text-amber-500 mb-3" />
//           <h4 className="font-semibold text-slate-900">Light Mode</h4>
//           <p className="text-sm text-slate-500 mt-1">Clean and bright interface</p>
//           {theme === 'light' && (
//             <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
//               <CheckCircle size={12} className="mr-1" /> Active
//             </div>
//           )}
//         </div>

//         <div
//           onClick={() => setTheme('dark')}
//           className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
//             theme === 'dark'
//               ? 'border-teal-500 bg-slate-800 shadow-lg shadow-teal-500/10'
//               : 'border-slate-200 hover:border-teal-300'
//           }`}
//         >
//           <Moon size={32} className="text-indigo-400 mb-3" />
//           <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
//             Dark Mode
//           </h4>
//           <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
//             Easy on the eyes, great for night
//           </p>
//           {theme === 'dark' && (
//             <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
//               <CheckCircle size={12} className="mr-1" /> Active
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const renderAppointmentSettings = () => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1.5">
//             Consultation Duration (minutes)
//           </label>
//           <input
//             type="number"
//             value={appointmentSettings.consultationDuration}
//             onChange={(e) => handleAppointmentChange('consultationDuration', parseInt(e.target.value))}
//             min="15"
//             max="120"
//             className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
//           />
//           <p className="text-xs text-slate-400 mt-1">Default duration for each consultation (15-120 minutes)</p>
//         </div>
//       </div>

//       <div className="border-t border-slate-100 pt-6">
//         <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-teal-200 transition-colors">
//           <div>
//             <p className="font-medium text-slate-900">Auto Approve Appointments</p>
//             <p className="text-sm text-slate-500">Automatically approve new appointment requests</p>
//           </div>
//           <button
//             onClick={() => handleAppointmentChange('autoApprove', !appointmentSettings.autoApprove)}
//             className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
//               appointmentSettings.autoApprove ? 'bg-teal-600' : 'bg-slate-300'
//             }`}
//           >
//             <div
//               className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
//                 appointmentSettings.autoApprove ? 'right-1' : 'left-1'
//               }`}
//             />
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-3 pt-4 border-t border-slate-100">
//         <button
//           onClick={handleSaveAppointmentSettings}
//           disabled={loading}
//           className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
//         >
//           <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
//         </button>
//       </div>
//     </div>
//   );

//   // ===================== RENDER CONTENT =====================
//   const renderContent = () => {
//     switch (activeTab) {
//       case 'profile': return renderAdminProfile();
//       case 'security': return renderSecurity();
//       case 'theme': return renderThemeSettings();
//       case 'appointment': return renderAppointmentSettings();
//       default: return renderAdminProfile();
//     }
//   };

//   // ===================== MAIN RENDER =====================
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="space-y-6"
//     >
//       {/* Header Section */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="relative"
//       >
//         <div className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl shadow-teal-600/20">
//           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
//           <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
//           <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

//           <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//             <div className="space-y-2">
//               <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
//                 <SettingsIcon className="w-8 h-8 text-teal-300" />
//                 Settings
//               </h1>
//               <p className="text-teal-100 text-sm">
//                 Manage your profile, security, and application preferences
//               </p>
//             </div>

//             <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-emerald-300" />
//                 <div>
//                   <p className="text-white text-xs font-bold">System Status</p>
//                   <p className="text-emerald-200 text-[11px]">Online</p>
//                 </div>
//               </div>
//               <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
//               <div className="flex items-center gap-2">
//                 <Shield className="w-5 h-5 text-blue-300" />
//                 <div>
//                   <p className="text-white text-xs font-bold">Role</p>
//                   <p className="text-blue-200 text-[11px]">Super Admin</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Tabs */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.1 }}
//         className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
//       >
//         <div className="flex flex-wrap gap-0 border-b border-slate-100 p-2">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
//                 activeTab === tab.id
//                   ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20'
//                   : 'text-slate-600 hover:bg-slate-100'
//               }`}
//             >
//               <tab.icon size={18} />
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>

//         {/* Content */}
//         <div className="p-4 sm:p-6">
//           <motion.div
//             key={activeTab}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             {renderContent()}
//           </motion.div>
//         </div>
//       </motion.div>

//       {/* Footer */}
//       <div className="text-center text-xs text-slate-400 pt-4">
//         <p>MediCare Hospital Management System v2.4.0</p>
//       </div>
//     </motion.div>
//   );
// };

// export default Settings;




// src/pages/admin/Settings.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  UserCircle,
  Shield,
  Calendar,
  Sun,
  Moon,
  Save,
  Edit,
  Eye,
  EyeOff,
  Key,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Admin Profile State - Real data from useAuth()
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Theme State
  const [theme, setTheme] = useState('light');

  // Appointment Settings State
  const [appointmentSettings, setAppointmentSettings] = useState({
    consultationDuration: 30,
    autoApprove: true,
  });

  const tabs = [
    { id: 'profile', label: 'Admin Profile', icon: UserCircle },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'theme', label: 'Theme Settings', icon: Sun },
    { id: 'appointment', label: 'Appointments', icon: Calendar },
  ];

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleAppointmentChange = (field, value) => {
    setAppointmentSettings(prev => ({ ...prev, [field]: value }));
  };

  // ==================== REAL API CALLS ====================

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });

      if (response.data.success) {
        // Update user context with new data
        updateUser({
          ...user,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        });
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        toast.success('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppointmentSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.updateAppointmentSettings({
        consultationDuration: appointmentSettings.consultationDuration,
        autoApprove: appointmentSettings.autoApprove,
      });

      if (response.data.success) {
        toast.success('Appointment settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating appointment settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    toast.success(`Theme switched to ${theme === 'light' ? 'dark' : 'light'} mode`);
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'doctor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'patient': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // ===================== RENDER FUNCTIONS =====================

  const renderAdminProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-500/20">
            {profile.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
          <p className="text-sm text-slate-500 capitalize">{user?.role || 'Admin'}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
              <CheckCircle size={12} className="mr-1" /> {user?.role || 'Admin'}
            </span>
          </div>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-teal-600/20 disabled:opacity-50"
        >
          <Edit size={14} /> {loading ? 'Saving...' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleProfileChange('name', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-teal-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-teal-800">Security Tips</p>
            <p className="text-sm text-teal-700 mt-1">
              Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          <Key size={16} /> {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Theme Preference</h3>
            <p className="text-sm text-slate-500 mt-1">Choose between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-16 h-10 rounded-full transition-colors duration-300 flex-shrink-0 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-teal-600'
            }`}
          >
            <div
              className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                theme === 'dark' ? 'right-1' : 'left-1'
              }`}
            >
              {theme === 'dark' ? (
                <Moon size={16} className="text-slate-700" />
              ) : (
                <Sun size={16} className="text-teal-600" />
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setTheme('light')}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
            theme === 'light'
              ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-500/10'
              : 'border-slate-200 hover:border-teal-300'
          }`}
        >
          <Sun size={32} className="text-amber-500 mb-3" />
          <h4 className="font-semibold text-slate-900">Light Mode</h4>
          <p className="text-sm text-slate-500 mt-1">Clean and bright interface</p>
          {theme === 'light' && (
            <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
              <CheckCircle size={12} className="mr-1" /> Active
            </div>
          )}
        </div>

        <div
          onClick={() => setTheme('dark')}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
            theme === 'dark'
              ? 'border-teal-500 bg-slate-800 shadow-lg shadow-teal-500/10'
              : 'border-slate-200 hover:border-teal-300'
          }`}
        >
          <Moon size={32} className="text-indigo-400 mb-3" />
          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Dark Mode
          </h4>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Easy on the eyes, great for night
          </p>
          {theme === 'dark' && (
            <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
              <CheckCircle size={12} className="mr-1" /> Active
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAppointmentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Consultation Duration (minutes)
          </label>
          <input
            type="number"
            value={appointmentSettings.consultationDuration}
            onChange={(e) => handleAppointmentChange('consultationDuration', parseInt(e.target.value))}
            min="15"
            max="120"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs text-slate-400 mt-1">Default duration for each consultation (15-120 minutes)</p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-teal-200 transition-colors">
          <div>
            <p className="font-medium text-slate-900">Auto Approve Appointments</p>
            <p className="text-sm text-slate-500">Automatically approve new appointment requests</p>
          </div>
          <button
            onClick={() => handleAppointmentChange('autoApprove', !appointmentSettings.autoApprove)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
              appointmentSettings.autoApprove ? 'bg-teal-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                appointmentSettings.autoApprove ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={handleSaveAppointmentSettings}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );

  // ===================== RENDER CONTENT =====================
  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderAdminProfile();
      case 'security': return renderSecurity();
      case 'theme': return renderThemeSettings();
      case 'appointment': return renderAppointmentSettings();
      default: return renderAdminProfile();
    }
  };

  // ===================== MAIN RENDER =====================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl shadow-teal-600/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-teal-300" />
                Settings
              </h1>
              <p className="text-teal-100 text-sm">
                Manage your profile, security, and application preferences
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-white text-xs font-bold">Status</p>
                  <p className="text-emerald-200 text-[11px]">Online</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-300" />
                <div>
                  <p className="text-white text-xs font-bold">Role</p>
                  <p className="text-blue-200 text-[11px] capitalize">{user?.role || 'Admin'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="flex flex-wrap gap-0 border-b border-slate-100 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;